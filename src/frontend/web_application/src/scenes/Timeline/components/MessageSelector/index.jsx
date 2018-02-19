import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans, Plural } from 'lingui-react';
import { Checkbox, Button, Spinner } from '../../../../components/';

import './style.scss';

@withI18n()
class MessageSelector extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    onSelectAllMessages: PropTypes.func,
    onEditTags: PropTypes.func,
    onDeleteMessages: PropTypes.func,
    count: PropTypes.number,
    totalCount: PropTypes.number,
    indeterminate: PropTypes.bool,
    checked: PropTypes.bool,
    isDeleting: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onSelectAllMessages: str => str,
    onEditTags: str => str,
    onDeleteMessages: str => str,
    count: 0,
    totalCount: 0,
    indeterminate: false,
    checked: false,
  };

  toggleCheckbox = (ev) => {
    const { checked } = ev.target;
    this.props.onSelectAllMessages(checked);
  }

  handleEditTags = () => {
    this.props.onEditTags();
  }

  handleDelete = () => {
    this.props.onDeleteMessages();
  }

  render() {
    const { i18n, count, totalCount, checked, isDeleting } = this.props;

    return (
      <div className="m-message-selector">
        {count !== 0 && (
          <span className="m-message-selector__title">
            <Plural
              id="message-list.message.selected"
              value={{ count, totalCount }}
              one={<Trans>{count}/{totalCount} message:</Trans>}
              other={<Trans>{count}/{totalCount} messages:</Trans>}
            />
          </span>
        )}
        <span className="m-message-selector__actions">
          <Button
            icon="tags"
            onClick={this.handleEditTags}
            disabled={count === 0}
            aria-label={i18n._('timeline.action.manage-tags', { defaults: 'Manage tags' })}
          />
          <Button
            icon={isDeleting ? (<Spinner isLoading display="inline" />) : 'trash'}
            onClick={this.handleDelete}
            disabled={count === 0}
            aria-label={i18n._('timeline.action.delete', { defaults: 'Delete selected' })}
          />
        </span>
        <span className="m-message-selector__checkbox">
          <Checkbox
            label={i18n._('message-list.action.select_all_messages', { defaults: 'Select/deselect all messages' })}
            id="message-selector"
            checked={checked}
            indeterminate={this.props.indeterminate}
            onChange={this.toggleCheckbox}
            disabled={isDeleting}
            showLabelforSr
          />
        </span>
      </div>
    );
  }
}

export default MessageSelector;
