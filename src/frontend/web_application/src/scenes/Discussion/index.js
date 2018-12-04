import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { loadMore, invalidate, deleteMessage as deleteMessageRaw } from '../../store/modules/message';
import { setMessageRead, deleteMessage, requestDiscussion } from '../../modules/message';
import { reply } from '../../modules/draftMessage';
import { createMessageCollectionStateSelector } from '../../store/selectors/message';
import { UserSelector } from '../../store/selectors/user';
import { withTags, updateTagCollection } from '../../modules/tags';
import { sortMessages } from '../../services/message';
import { getUser } from '../../modules/user/actions/getUser';
import { withPush } from '../../modules/routing/hoc/withPush';
import Discussion from './presenter';

const getDiscussionIdFromProps = props => props.match.params.discussionId;
const discussionIdSelector = (state, ownProps) => getDiscussionIdFromProps(ownProps);
const discussionSelector = state => state.discussion;

const messageByIdSelector = state => state.message.messagesById;
const messageCollectionStateSelector = createMessageCollectionStateSelector(() => 'discussion', discussionIdSelector);

const mapStateToProps = createSelector(
  [messageByIdSelector, discussionSelector,
    discussionIdSelector, UserSelector, messageCollectionStateSelector],
  (messagesById, discussionState, discussionId, userState, {
    didInvalidate, messageIds, hasMore, isFetching,
  }) => {
    const canBeClosed = messageIds.length === 0;
    const messages = sortMessages(
      messageIds.map(messageId => messagesById[messageId])
        .filter(msg => msg.is_draft === false),
      false
    );

    return {
      discussionId,
      user: userState.user,
      isUserFetching: userState.isFetching,
      discussion: discussionState.discussionsById[discussionId],
      messages,
      isFetching,
      didInvalidate,
      hasMore,
      canBeClosed,
    };
  }
);

const deleteDiscussion = ({ discussionId, messages }) => async (dispatch) => {
  await Promise.all(messages.map(message => dispatch(deleteMessageRaw({ message }))));

  return dispatch(invalidate({ type: 'discussion', key: discussionId }));
};

const onMessageSent = ({ message }) => (dispatch) => {
  dispatch(invalidate({ type: 'discussion', key: message.discussion_id }));
};
const updateDiscussionTags = ({ i18n, messages, tags }) => async dispatch =>
  Promise.all(messages.map(message =>
    dispatch(updateTagCollection(i18n, { type: 'message', entity: message, tags }))));

const onMessageReply = ({ message, discussionId }) => async (dispatch) => {
  dispatch(reply({ internalId: discussionId, message }));
};

const mapDispatchToProps = (dispatch, ownProps) => bindActionCreators({
  loadMore: loadMore.bind(null, 'discussion', getDiscussionIdFromProps(ownProps)),
  setMessageRead,
  deleteMessage,
  deleteDiscussion,
  requestDiscussion:
    requestDiscussion.bind(null, { discussionId: getDiscussionIdFromProps(ownProps) }),
  updateDiscussionTags,
  onMessageReply,
  onMessageSent,
  getUser,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTags(),
  withPush(),
)(Discussion);
