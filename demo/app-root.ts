import { LocalCache } from '@internetarchive/local-cache';
import {
  html,
  css,
  LitElement,
  customElement,
  internalProperty,
} from 'lit-element';
import { nothing, TemplateResult } from 'lit-html';
import { User } from '../src/models';
import { UserService } from '../src/user-service';
import { UserServiceErrorType } from '../src/user-service-error';

@customElement('app-root')
export class AppRoot extends LitElement {
  localCache = new LocalCache({ defaultTTL: 60 * 1000 });

  userService = new UserService({ cache: this.localCache });

  @internalProperty()
  private user?: User | null;

  @internalProperty()
  private loading = false;

  @internalProperty()
  private error?: string;

  firstUpdated(): void {
    this.fetchUser();
  }

  render() {
    return html`
      <h1>User Info</h1>
      <p>
        To test this, make sure you add an archive.org hostname to your
        /etc/hosts file so the browser can use the archive.org cookies. eg:
      </p>
      <pre>127.0.0.1 local.archive.org</pre>
      <p>
        Then access
        <a href="https://local.archive.org:8000/demo"
          >https://local.archive.org:8000/demo</a
        >
      </p>
      <hr />
      <h2>Status</h2>
      ${this.error ? html`<p>Error: ${this.error}</p>` : nothing}
      ${this.loading ? html`<p>Loading...</p>` : this.userInfoTemplate}
    `;
  }

  private get userInfoTemplate(): TemplateResult {
    if (!this.user) {
      return html`
        <p>Not logged in</p>
        <p><a href="https://archive.org/account/login">Login</a></p>
      `;
    }

    return html`
      <p>Screen name: ${this.user.screenname}</p>
      <p>Item name: ${this.user.itemname}</p>
      <p>User name: ${this.user.username}</p>
      <p>Privs: ${this.user.privs}</p>
      <p><a href="https://archive.org/account/logout">Logout</a></p>
    `;
  }

  private async fetchUser() {
    this.error = undefined;
    const result = await this.userService.getLoggedInUserResult();
    if (result.success) {
      this.user = result.success;
    } else if (result.error) {
      switch (result.error.type) {
        case UserServiceErrorType.userNotLoggedIn:
          console.info('User not logged in');
          break;
        case UserServiceErrorType.networkError:
          console.error('There was a network error fetching the user');
          break;
        case UserServiceErrorType.decodingError:
          console.error(
            'There was an error decoding the user service response'
          );
          break;
        default:
          console.error('An unknown error occurred fetching the user');
      }
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--your-webcomponent-text-color, #000);
    }
  `;
}
