export const CREATE_DRAFT = 'co/draft-message/CREATE_DRAFT';
export const SYNC_DRAFT = 'co/draft-message/SYNC_DRAFT';
export const EDIT_DRAFT = 'co/draft-message/EDIT_DRAFT';
export const SAVE_DRAFT = 'co/draft-message/SAVE_DRAFT';
export const SEND_DRAFT = 'co/draft-message/SEND_DRAFT';
export const CLEAR_DRAFT = 'co/draft-message/CLEAR_DRAFT';
export const SET_RECIPIENT_SEARCH_TERMS = 'co/draft-message/SET_RECIPIENT_SEARCH_TERMS';

export function editDraft({ internalId, draft, message }) {
  return {
    type: EDIT_DRAFT,
    payload: { internalId, draft, original: message },
  };
}

export function saveDraft({ internalId, draft, message }) {
  return {
    type: SAVE_DRAFT,
    payload: { internalId, draft, original: message },
  };
}

export function createDraft({ internalId, draft }) {
  return {
    type: CREATE_DRAFT,
    payload: { internalId, draft },
  };
}

export function syncDraft({ internalId, draft }) {
  return {
    type: SYNC_DRAFT,
    payload: { internalId, draft },
  };
}

export function sendDraft({ internalId, draft, message }) {
  return {
    type: SEND_DRAFT,
    payload: { internalId, draft, original: message },
  };
}

export function clearDraft({ internalId }) {
  return {
    type: CLEAR_DRAFT,
    payload: { internalId },
  };
}

export function setRecipientSearchTerms({ internalId, searchTerms }) {
  return {
    type: SET_RECIPIENT_SEARCH_TERMS,
    payload: { internalId, searchTerms },
  };
}

function syncDraftReducer(state, message) {
  const {
    body,
    subject,
    participants,
    parent_id: parentId,
    identities,
  } = state;

  return {
    ...message,
    body,
    subject,
    participants,
    parent_id: parentId,
    identities,
  };
}

function draftReducer(state = {}, action) {
  switch (action.type) {
    case CREATE_DRAFT:
    case EDIT_DRAFT:
      return {
        ...state,
        ...action.payload.draft,
      };
    case SYNC_DRAFT:
      return syncDraftReducer(state, action.payload.draft);
    default:
      return state;
  }
}

function dratfsByInternalIdReducer(state, action) {
  switch (action.type) {
    case CREATE_DRAFT:
    case SYNC_DRAFT:
      return {
        ...state,
        [action.payload.internalId]:
          draftReducer(state[action.payload.internalId], action),
      };
    case EDIT_DRAFT:
      return {
        ...state,
        [action.payload.internalId]: draftReducer(state[action.payload.internalId], action),
      };
    case CLEAR_DRAFT:
      return {
        ...state,
        [action.payload.internalId]: undefined,
      };
    default:
      return state;
  }
}

const initialState = {
  didInvalidate: false,
  draftsByInternalId: {},
  recipientSearchTermsByInternalId: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_DRAFT:
      return {
        ...state,
        draftsByInternalId: dratfsByInternalIdReducer(state.draftsByInternalId, action),
      };
    case EDIT_DRAFT:
    case CLEAR_DRAFT:
    case SYNC_DRAFT:
      return {
        ...state,
        draftsByInternalId: dratfsByInternalIdReducer(state.draftsByInternalId, action),
      };
    case SET_RECIPIENT_SEARCH_TERMS: {
      return {
        ...state,
        recipientSearchTermsByInternalId: {
          ...state.recipientSearchTermsByInternalId,
          [action.payload.internalId]: action.payload.searchTerms,
        },
      };
    }
    default:
      return state;
  }
}
