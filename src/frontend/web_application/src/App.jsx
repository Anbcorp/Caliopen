import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { I18nLoader } from './modules/i18n';
import { WithSettings } from './modules/settings';
import { DeviceProvider } from './modules/device';
import { SwitchWithRoutes, RoutingConsumer, RoutingProvider } from './modules/routing';
import { PageTitle } from './components/';
import { initConfig } from './services/config';
import { NotificationProvider } from './modules/notification';
import './app.scss';

// eslint-disable-next-line react/prefer-stateless-function
class App extends Component {
  static propTypes = {
    store: PropTypes.shape({ dispatch: PropTypes.func.isRequired }).isRequired,
    config: PropTypes.shape({}),
  };

  static defaultProps = {
    config: {},
  };

  componentWillMount() {
    if (this.props.config) {
      initConfig(this.props.config);
    }
  }

  render() {
    const { store } = this.props;

    return (
      <Provider store={store}>
        <WithSettings render={settings => (
          <I18nLoader locale={settings.default_locale}>
            <RoutingProvider settings={settings}>
              <PageTitle />
              <DeviceProvider>
                <RoutingConsumer
                  render={({ routes }) => (
                    <SwitchWithRoutes routes={routes} />
                  )}
                />
              </DeviceProvider>
              <NotificationProvider />
            </RoutingProvider>
          </I18nLoader>
        )}
        />
      </Provider>
    );
  }
}

export default App;
