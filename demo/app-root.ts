import { LocalCache } from '@internetarchive/local-cache';
import {
  html,
  css,
  LitElement,
  customElement,
  internalProperty,
} from 'lit-element';
import { TemplateResult } from 'lit-html';
import { User } from '../src/models';
import { UserService } from '../src/user-service';

@customElement('app-root')
export class AppRoot extends LitElement {
  localCache = new LocalCache();

  userService = new UserService({ localCache: this.localCache });

  @internalProperty()
  private user?: User | null;

  @internalProperty()
  private loading = false;

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
        <a href="https://local.archive.org:8000"
          >https://local.archive.org:8000</a
        >
      </p>
      <p>I</p>
      <hr />
      <h2>Status</h2>
      ${this.loading ? html`Loading...` : this.userInfoTemplate}
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
    this.user = await this.userService.getLoggedInUser();
  }

  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--your-webcomponent-text-color, #000);
    }
  `;
}
