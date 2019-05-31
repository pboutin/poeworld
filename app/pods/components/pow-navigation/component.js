// Vendor
import {tagName} from '@ember-decorators/component';
import Component from '@ember/component';
import {service} from '@ember-decorators/service';
import {reads} from '@ember-decorators/object/computed';

// Constants
import EXTERNAL_SITES from 'poe-world/constants/external-sites';

@tagName('')
export default class Navigation extends Component {
  @service('active-league/setting')
  activeLeagueSetting;

  @service('global-state')
  globalState;

  externalSites = EXTERNAL_SITES;

  @reads('activeLeagueSetting.league.name')
  leagueName;

  @reads('globalState.isAuthenticated')
  isAuthenticated;
}
