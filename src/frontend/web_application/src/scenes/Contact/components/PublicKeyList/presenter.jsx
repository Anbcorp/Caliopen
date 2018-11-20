import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button, Icon } from '../../../../components';
import PublicKeyForm from '../PublicKeyForm';

import './style.scss';

const KEY_QUALITY_CLASSES = ['weak', 'average', 'good'];
const KEY_QUALITY_ICONS = ['exclamation-triangle', 'expire-soon', 'info-circle'];

class PublicKeyList extends Component {
  static propTypes = {
    contactId: PropTypes.string.isRequired,
    publicKeys: PropTypes.arrayOf(PropTypes.shape({})),
    requestPublicKeys: PropTypes.func.isRequired,
    didInvalidate: PropTypes.bool,
    isFetching: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    didInvalidate: false,
    publicKeys: [],
  };

  state = {
    editMode: false,
    editKey: null,
  };

  componentDidMount() {
    const {
      publicKeys, contactId, requestPublicKeys, isFetching,
    } = this.props;

    if (!isFetching && (publicKeys.length === 0 || this.props.didInvalidate)) {
      requestPublicKeys({ contactId });
    }
  }

  componentDidUpdate() {
    const {
      publicKeys, contactId, requestPublicKeys, isFetching,
    } = this.props;

    if (!isFetching && (publicKeys.length === 0 || this.props.didInvalidate)) {
      requestPublicKeys({ contactId });
    }
  }

  onSuccess = () => {
    const { contactId } = this.props;

    this.setState({ editMode: false }, () => {
      this.props.requestPublicKeys({ contactId });
    });
  }

  getKeyQuality = (publicKey) => {
    let score = 2;

    score -= Date.parse(publicKey.expire_date) > Date.now() ? 0 : 1;
    // XXX: not sure about this
    // score -= publicKey.size >= 2048 ? 0 : 1;

    return score;
  };

  enterAddMode = () => {
    this.setState({ editMode: true, editKey: null });
  }

  quitEditMode = () => {
    this.setState({ editMode: false });
  }

  handleEdit = publicKey => () => this.setState({ editMode: true, editKey: publicKey.key_id });

  renderKeyItem = (publicKey) => {
    const { contactId } = this.props;

    if (this.state.editMode && this.state.editKey === publicKey.key_id) {
      return (
        <li key={publicKey.key_id}>
          <PublicKeyForm
            key={publicKey.key_id}
            contactId={contactId}
            publicKey={publicKey}
            onSuccess={this.onSuccess}
            onCancel={this.quitEditMode}
          />
        </li>
      );
    }

    return (
      <li key={publicKey.key_id} className="m-public-key-list__key">
        <Icon
          type={KEY_QUALITY_ICONS[this.getKeyQuality(publicKey)]}
          className={`m-public-key-list__quality-icon--${KEY_QUALITY_CLASSES[this.getKeyQuality(publicKey)]}`}
          rightSpaced
        />
        <strong className="m-public-key-list__key-label">{publicKey.label}</strong>&nbsp;:&nbsp;{publicKey.fingerprint}
        <Button icon="edit" className="m-public-key-list__edit-button" onClick={this.handleEdit(publicKey)} />
      </li>
    );
  }

  renderAddForm = () => {
    const { contactId } = this.props;

    if (this.state.editMode && !this.state.editKey) {
      return (
        <PublicKeyForm
          contactId={contactId}
          onSuccess={this.onSuccess}
          onCancel={this.quitEditMode}
        />
      );
    }

    return (
      <Button onClick={this.enterAddMode} color="active" icon="key" type="button">
        <Trans id="contact.public_keys_list.add_key.label">Add public key</Trans>
      </Button>
    );
  }

  render() {
    const { publicKeys } = this.props;

    return (
      <Fragment>
        <ul>
          {publicKeys.map(publicKey => this.renderKeyItem(publicKey))}
        </ul>
        {this.renderAddForm()}
      </Fragment>
    );
  }
}

export default PublicKeyList;
