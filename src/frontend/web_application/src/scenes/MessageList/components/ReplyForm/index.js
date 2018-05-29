import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { withI18n } from 'lingui-react';
import { withNotification } from '../../../../hoc/notification';
import { createMessageCollectionStateSelector } from '../../../../store/selectors/message';
import { requestDraft, clearDraft, syncDraft } from '../../../../store/modules/draft-message';
import { updateTagCollection, withTags } from '../../../../modules/tags';
import { saveDraft, sendDraft } from '../../../../modules/draftMessage';
import { uploadDraftAttachments, deleteDraftAttachment } from '../../../../modules/file';
import { deleteMessage } from '../../../../modules/message';
import { getLastMessage } from '../../../../services/message';
import Presenter from './presenter';

const messageDraftSelector = state => state.draftMessage;
const discussionIdSelector = (state, ownProps) => ownProps.discussionId;
const internalIdSelector = (state, ownProps) => ownProps.internalId;
const userSelector = state => state.user.user;
const messageCollectionStateSelector = createMessageCollectionStateSelector(() => 'discussion', discussionIdSelector);

const mapStateToProps = createSelector(
  [
    messageDraftSelector, discussionIdSelector, internalIdSelector, messageCollectionStateSelector,
    userSelector,
  ],
  (draftState, discussionId, internalId, { messages }, user) => {
    const message = messages && messages.find(item => item.is_draft === true);
    const sentMessages = messages.filter(item => item.is_draft !== true);
    const lastMessage = getLastMessage(sentMessages);
    const { isFetching, draftsByInternalId } = draftState;
    const draft = draftsByInternalId[internalId] || message;
    const parentMessage = draft && sentMessages
      .find(item => item.message_id === draft.parent_id && item !== lastMessage);

    return {
      allowEditRecipients: messages.length === 1 && message && true,
      message,
      parentMessage,
      draft,
      isFetching,
      discussionId,
      user,
    };
  }
);

const onEditDraft = ({ internalId, draft, message }) => dispatch =>
  dispatch(saveDraft({ internalId, draft, message }, { withThrottle: true }));

const onSaveDraft = ({ internalId, draft, message }) => dispatch =>
  dispatch(saveDraft({ internalId, draft, message }, { force: true }));

const onDeleteMessage = ({ message, internalId, isNewDiscussion }) => async (dispatch) => {
  const result = dispatch(deleteMessage({ message }));
  await dispatch(clearDraft({ internalId }));

  if (isNewDiscussion) {
    return dispatch(push('/'));
  }

  return result;
};

const onUpdateEntityTags = (internalId, i18n, message, { type, entity, tags }) =>
  async (dispatch) => {
    const savedDraft = await dispatch(saveDraft({ internalId, draft: entity, message }, {
      withThrottle: false,
      force: true,
    }));
    const messageUpTodate = await dispatch(updateTagCollection(
      i18n,
      { type, entity: savedDraft, tags }
    ));

    return dispatch(syncDraft({ internalId, draft: messageUpTodate }));
  };

const onUploadAttachments = (internalId, i18n, message, { draft, attachments }) =>
  async (dispatch) => {
    try {
      const savedDraft = await dispatch(saveDraft({ internalId, draft, message }, {
        withThrottle: false,
        force: true,
      }));

      const messageUpTodate = await dispatch(uploadDraftAttachments({
        message: savedDraft, attachments,
      }));

      return dispatch(syncDraft({ internalId, draft: messageUpTodate }));
    } catch (err) {
      return Promise.reject(err);
    }
  };

const onDeleteAttachement = (internalId, i18n, message, { draft, attachment }) =>
  async (dispatch) => {
    try {
      const savedDraft = await dispatch(saveDraft({ internalId, draft, message }, {
        withThrottle: false,
        force: true,
      }));

      const messageUpTodate = await dispatch(deleteDraftAttachment({
        message: savedDraft, attachment,
      }));

      return dispatch(syncDraft({ internalId, draft: messageUpTodate }));
    } catch (err) {
      return Promise.reject(err);
    }
  };

const onSendDraft = ({ draft, message, internalId }) => async (dispatch) => {
  try {
    const messageUpToDate = await dispatch(saveDraft({ draft, message, internalId }, {
      withThrottle: false,
    }));
    await dispatch(sendDraft({ draft: messageUpToDate }));

    return dispatch(clearDraft({ internalId }));
  } catch (err) {
    return Promise.reject(err);
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  onEditDraft,
  onSaveDraft,
  onSendDraft,
  requestDraft,
  onDeleteMessage,
  onUpdateEntityTags,
  onUploadAttachments,
  onDeleteAttachement,
}, dispatch);

export default compose(...[
  withI18n(),
  withNotification(),
  withTags(),
  connect(mapStateToProps, mapDispatchToProps),
])(Presenter);
