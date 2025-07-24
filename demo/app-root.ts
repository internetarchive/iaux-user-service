import { LocalCache } from '@internetarchive/local-cache';
import { html, css, LitElement, TemplateResult, nothing } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { User } from '../src/models/user';
import { UserService } from '../src/user-service';
import { UserServiceErrorType } from '../src/user-service-error';

@customElement('app-root')
export class AppRoot extends LitElement {
  localCache = new LocalCache({ defaultTTL: 60 * 1000 });

  userService = new UserService({ cache: this.localCache });

  @state()
  private user?: User | null;

  @state()
  private loading = false;

  @state()
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
      <p>Privs:
      <ul>${this.user.privs.map(priv => {
        return html`<li>${priv}</li>`;
      })}</ul></p>
      <p><a href="https://archive.org/account/logout">Logout</a></p>
    `;
  }

  private async fetchUser() {
    this.error = undefined;
    const result = await this.userService.getLoggedInUser();
    if (result.success) {
      this.user = result.success;
      return;
    }

    switch (result.error?.type) {
      case UserServiceErrorType.userNotLoggedIn:
        break;
      case UserServiceErrorType.networkError:
        this.error = 'There was a network error fetching the user';
        break;
      case UserServiceErrorType.decodingError:
        this.error = 'There was an error decoding the user service response';
        break;
      default:
        this.error = 'An unknown error occurred fetching the user';
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 25px;
    }
  `;
}
