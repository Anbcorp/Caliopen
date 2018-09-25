// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/CaliOpen/Caliopen/src/backend/brokers/go.emails"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/satori/go.uuid"
	"io"
	"strconv"
)

func (rest *RESTfacility) AddAttachment(user *UserInfo, message_id, filename, content_type string, file io.Reader) (attachmentPath string, err error) {
	//check if message_id belongs to user and is a draft
	msg, err := rest.store.RetrieveMessage(user.User_id, message_id)
	if err != nil {
		return "", err
	}
	if !msg.Is_draft {
		return "", errors.New("message " + message_id + " is not a draft.")
	}

	//store temporary file in objectStore facility
	tmpId := uuid.NewV4()
	tempId = tmpId.String()
	url, size, err := rest.store.StoreAttachment(tempId, file)
	if err != nil {
		return "", err
	}

	//update draft with new attachment references
	draftAttchmnt := Attachment{
		ContentType: content_type,
		FileName:    filename,
		IsInline:    false,
		Size:        size,
		TempID:      UUID(tmpId),
		URL:         url,
	}
	draftAttchmnt.TempID.UnmarshalBinary(tmpId.Bytes())
	msg.Attachments = append(msg.Attachments, draftAttchmnt)

	//update store
	fields := make(map[string]interface{})
	fields["Attachments"] = msg.Attachments
	err = rest.store.UpdateMessage(msg, fields)
	if err != nil {
		//roll-back attachment storage before returning the error
		rest.store.DeleteAttachment(url)
		return "", err
	}
	//update index
	err = rest.index.UpdateMessage(user, msg, fields)
	if err != nil {
		//roll-back attachment storage before returning the error
		fields["Attachments"] = msg.Attachments[:len(msg.Attachments)-1]
		rest.store.UpdateMessage(msg, fields)
		rest.store.DeleteAttachment(url)
		return "", err
	}

	return
}

func (rest *RESTfacility) DeleteAttachment(user *UserInfo, message_id string, attchmtIndex int) error {
	//check if message_id belongs to user and is a draft and index is consistent
	msg, err := rest.store.RetrieveMessage(user.User_id, message_id)
	if err != nil {
		var msg string
		if err.Error() == "not found" {
			msg = "message not found"
		}
		return WrapCaliopenErr(err, DbCaliopenErr, msg)
	}

	if !msg.Is_draft {
		return NewCaliopenErrf(ForbiddenCaliopenErr, "message %s is not a draft", message_id)
	}

	//find and remove attachment's from draft
	for i, attachment := range msg.Attachments {
		if attachment.TempID.String() == attchmt_id {
			msg.Attachments = append(msg.Attachments[:i], msg.Attachments[i+1:]...)

			//update store
			fields := make(map[string]interface{})
			fields["Attachments"] = msg.Attachments
			rest.store.UpdateMessage(msg, fields)
			if err != nil {
				return WrapCaliopenErr(err, DbCaliopenErr, "")
			}
			//update index
			err = rest.index.UpdateMessage(user, msg, fields)

			//remove temporary file from object store
			err = rest.store.DeleteAttachment(attachment.URL)
			if err != nil {
				return WrapCaliopenErrf(err, DbCaliopenErr, "failed to remove temp attachment at uri '%s' with error <%s>", attachment.URL, err.Error())
			}
			return nil
		}
	}

	return NewCaliopenErr(NotFoundCaliopenErr, "attachment not found")

}

// returns an io.Reader and metadata to conveniently read the attachment
func (rest *RESTfacility) OpenAttachment(user_id, message_id, attchmtIndex string) (meta map[string]string, content io.Reader, err error) {
	if attchmtIndex == "" {
		return meta, nil, errors.New(fmt.Sprint("empty attachment id"))
	}
	meta = make(map[string]string)
	//check if message_id belongs to user and index is consistent
	msg, err := rest.store.RetrieveMessage(user_id, message_id)
	if err != nil {
		return meta, nil, err
	}
	var index int
	if msg.Is_draft {
		// retrieve attachment by temp_id
		notfound := true
		for _, att := range msg.Attachments {
			if att.TempID.String() == attchmtIndex {
				meta["Content-Type"] = att.ContentType
				meta["Message-Size"] = strconv.Itoa(att.Size)
				meta["Filename"] = att.FileName
				meta["Url"] = att.URL
				notfound = false
				break
			}
		}
		if notfound {
			return meta, nil, NewCaliopenErr(NotFoundCaliopenErr, "attachment not found")
		}

	} else {
		// retrieve attachment by index
		index, err = strconv.Atoi(attchmtIndex)
		if err != nil || index < 0 || index > (len(msg.Attachments)-1) {
			return meta, nil, NewCaliopenErr(NotFoundCaliopenErr, "attachment not found")
		}
		meta["Content-Type"] = msg.Attachments[index].ContentType
		meta["Message-Size"] = strconv.Itoa(msg.Attachments[index].Size)
		meta["Filename"] = msg.Attachments[index].FileName
	}

	// create a Reader
	// either from object store (draft context)
	// or from raw message's mime part (non-draft context)
	if msg.Is_draft {
		attachment, e := rest.store.GetAttachment(meta["Url"])
		if e != nil {
			return map[string]string{}, nil, e
		}
		content = attachment
		return

	} else {
		rawMsg, e := rest.store.GetRawMessage(msg.Raw_msg_id.String())
		if e != nil {
			return map[string]string{}, nil, e
		}
		json_email, e := email_broker.EmailToJsonRep(rawMsg.Raw_data)
		if e != nil {
			return map[string]string{}, nil, e
		}
		attachments, e := json_email.ExtractAttachments(index)
		if e != nil {
			return map[string]string{}, nil, e
		}
		content = bytes.NewReader(attachments[0])
		return
	}
}
