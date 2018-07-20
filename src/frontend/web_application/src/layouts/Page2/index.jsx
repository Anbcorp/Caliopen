import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Brand, Link, Button, Icon } from '../../components/';
import { BackgroundImage } from '../../modules/pi';
import { PageActions } from '../../modules/control';
import { UserMenu } from '../../modules/user';
import StickyNavBar from '../Page/components/Navigation/components/StickyNavBar';
import Navigation from './components/Navigation';
import PageContainer from '../PageContainer';
import './style.scss';
import './header.scss';
import './navbar.scss';
import './footer.scss';

// eslint-disable-next-line react/prefer-stateless-function
class Page extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { children } = this.props;

    return (
      <BackgroundImage context="secure" className="l-page">
        {/* <div className="header-device">
          <PageContainer>
            Vous consultez actuellement vos messages dans un environement que vous avez classé comme
            <Link href="#">sûr</Link>, depuis un <Link href="#">appareil de confiance.</Link>
          </PageContainer>
        </div> */}
        <div className="l-header">
          <PageContainer>
            <Link to="/"><Brand className="l-header__brand" /></Link>
            <div className="l-header__notif-menu"><Button href="#"><Icon type="bell" /></Button></div>
            <div className="l-header__user-menu">
              <UserMenu />
            </div>
          </PageContainer>
        </div>

        <PageContainer>
          <PageActions className="l-page__main-actions" />
        </PageContainer>

        <div className="l-navbar">
          <StickyNavBar
            className="l-navbar__wrapper"
            stickyClassName="l-navbar__wrapper--sticky"
          >
            <PageContainer>
              <Navigation />
            </PageContainer>
          </StickyNavBar>
        </div>

        <PageContainer>
          {children}
        </PageContainer>

        <PageContainer>
          <div className="l-footer">
            {/* <Tips /> */}
            <div className="l-footer__tips">
              <b>Astuce : </b>
              pour améliorer la confidentialitéde vos échanges, saviez-vous que vous pouviez lorem
              ipsum dolor sit amet!
            </div>

            {/* <Footer /> */}
            <div className="l-footer__logo"><Brand className="l-footer__brand" theme="low" /></div>
            <div className="l-footer__release">v0.0.0 Be good.</div>
          </div>
        </PageContainer>
      </BackgroundImage>
    );
  }
}

export default Page;
