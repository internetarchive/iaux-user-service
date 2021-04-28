import { expect } from '@open-wc/testing';
import { User } from '../src/models/user';

describe('User', () => {
  it('can be instantiated', async () => {
    const user = new User({
      username: 'foo@bar.org',
      itemname: '@foo-user',
      screenname: 'Foo-Bar',
      privs: ['/'],
    });

    expect(user.username).to.equal('foo@bar.org');
    expect(user.itemname).to.equal('@foo-user');
    expect(user.screenname).to.equal('Foo-Bar');
    expect(user.userid).to.equal('foo-user');
    expect(user.privs).to.deep.equal(['/']);
  });

  it('userid is the itemname if it has no at sign', async () => {
    const user = new User({
      username: 'foo@bar.org',
      itemname: 'foo-user',
      screenname: 'Foo-Bar',
      privs: ['/'],
    });

    expect(user.itemname).to.equal('foo-user');
    expect(user.userid).to.equal('foo-user');
  });
});
