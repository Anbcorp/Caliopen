import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { PageTitle, Button, ActionBar } from '../../components';
import { withPush, withSearchParams } from '../../modules/routing';
import { withCloseTab, withCurrentTab } from '../../modules/tab';
import ContactList from '../ContactBook/components/ContactList';
import './contact-association.scss';

@withCloseTab()
@withCurrentTab()
@withPush()
@withSearchParams()
@withI18n()
class ContactAssociation extends Component {
  static propTypes = {
    i18n: PropTypes.shape({}).isRequired,
    loadMoreContacts: PropTypes.func.isRequired,
    isFetching: PropTypes.bool,
    searchParams: PropTypes.shape({
      label: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        address: PropTypes.string.isRequired,
        protocol: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    contacts: PropTypes.arrayOf(PropTypes.shape({})),
    userContact: PropTypes.shape({}),
    hasMore: PropTypes.bool.isRequired,
    push: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    currentTab: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    isFetching: false,
    contacts: undefined,
    userContact: undefined,
  };
  state = {};

  handleClickContact = ({ contact }) => {
    const {
      push, closeTab, currentTab,
      match: { params: { address, protocol } }, searchParams: { label },
    } = this.props;

    push(`/contacts/${contact.contact_id}/edit?address=${address}&protocol=${protocol}&label=${label}`);
    closeTab(currentTab);
  }

  handleClickNewContact = () => {
    const {
      push, closeTab, currentTab,
      match: { params: { address, protocol } }, searchParams: { label },
    } = this.props;

    push(`/new-contact?address=${address}&protocol=${protocol}&label=${label}`);
    closeTab(currentTab);
  }

  loadMore = () => {
    this.props.loadMoreContacts();
  }

  renderActionBar() {
    const {
      isFetching,
    } = this.props;

    return (
      <ActionBar
        className="s-contact-book-menu"
        hr={false}
        isLoading={isFetching}
        actionsNode={(
          <Button
            className="s-contact-book-menu__action-btn"
            display="inline"
            noDecoration
            icon="plus"
            onClick={this.handleClickNewContact}
          >
            <Trans id="contact-association.action.add-new-contact">Add new contact</Trans>
          </Button>
        )}
      />
    );
  }

  renderContacts() {
    const {
      contacts, userContact, hasMore,
    } = this.props;

    return (
      <Fragment>
        <ContactList
          contacts={contacts}
          userContact={userContact}
          onClickContact={this.handleClickContact}
          mode="association"
        />
        {hasMore && (
          <div className="s-contact-book-list__load-more">
            <Button shape="hollow" onClick={this.loadMore}>
              <Trans id="general.action.load_more">Load more</Trans>
            </Button>
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const { i18n } = this.props;

    return (
      <div className="s-contact-association">
        <PageTitle title={i18n._('header.menu.contacts', null, { defaults: 'Contact association' })} />
        {this.renderActionBar()}
        {this.renderContacts()}
      </div>
    );
  }
}

export default ContactAssociation;
