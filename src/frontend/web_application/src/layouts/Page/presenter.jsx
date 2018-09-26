/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import OffCanvas from './components/OffCanvas';

import './style.scss';

class PageContainer extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    requestUser: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
  };

  componentDidMount() {
    this.props.requestUser();
  }

  render() {
    const { children, i18n } = this.props;
    const fakeContext = 'secure';

    return (
      <OffCanvas leftChildren={<NavigationAlt />}>
        <BackgroundImage context={fakeContext}>
          <div className="l-body">
            <Header />
            <Navigation />
            <section role="main">
              <div className="l-body__content">{children}</div>
            </section>
            <section>
              <div
                className="l-body__footer-alpha"
                dangerouslySetInnerHTML={{ __html: i18n._('alpha.footer.feedback', { defaults: 'Tell us if something went wrong at <a href="https://feedback.caliopen.org/">https://feedback.caliopen.org/</a>.' }) }}
              />
            </section>
            <CallToAction />
            <NotificationCenter />
          </div>
        </BackgroundImage>
      </OffCanvas>
    );
  }
}

export default PageContainer;
