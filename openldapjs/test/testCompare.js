'use strict';
const LdapAsyncWrap = require('../modules/ldapAsyncWrap.js');
const should = require('should');

describe('Testing the Compare functionalities', () => {
  const hostAddress = 'ldap://10.16.0.194:389';
  const dn = 'cn=admin,dc=demoApp,dc=com';
  const password = 'secret';
  let ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

  /* Attributes and Values */
  const attr = 'cn';
  const val = 'admin';

  const nonVal = 'nonExistingValue';
  const nonAttr = 'nonExistingAttr';
  const nonObj = 'cn=cghitea,ou=user55s,o=myhost,dc=demoApp,dc=com';
  const noPass = 'wrongPass';

  const comparisonResTrue = 'The Comparison Result: true';
  const comparisonResFalse = 'The Comparison Result: false';
  const LDAP_UNDEFINED_TYPE = '17';
  const LDAP_NO_SUCH_OBJECT = '32';

  beforeEach((next) => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize()
    .then(() => {
      ldapAsyncWrap.bind(dn, password)
      .then(() => {
        next();
      })
    })
  });

  afterEach(() => {
    ldapAsyncWrap.unbind()
    .then(() => {

    })
  });

  it('should compare existing attribute', (next) => {
    ldapAsyncWrap.compare(dn, attr, val)
    .then((result) => {
      should.deepEqual(result, comparisonResTrue);
      next();
    });
  })


  it('should compare not existing value for attribute', (next) => {
    ldapAsyncWrap.compare(dn, attr, nonVal)
    .then((result) => {
      should.deepEqual(result, comparisonResFalse);
      next();
    })
  })


  it('should compare not existing attribute', (next) => {
    ldapAsyncWrap.compare(dn, nonAttr, val)
    .catch((err) => {
      should.deepEqual(err.message, LDAP_UNDEFINED_TYPE);
      next();
    }) 
  })


  it('should compare not existing object', (next) => {
    ldapAsyncWrap.compare(nonObj, attr, val)
    .catch((err) => {
      should.deepEqual(err.message, LDAP_NO_SUCH_OBJECT);
      next();
    }) 
  })


  it('should not compare with denied access', (next) => {
    const noAccessDn = 'cn=cghitea,ou=users,o=myhost,dc=demoApp,dc=com';
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize()
    .then(() => {
      ldapAsyncWrap.bind(noAccessDn, password)
      .then(() => {
        ldapAsyncWrap.compare(dn, attr, val)
        .catch((err) => {
          should.deepEqual(err.message, LDAP_NO_SUCH_OBJECT);
          next();
        }) 
      })
    })
    
  })

  it('should not compare if the binding failed', (next) => {
    ldapAsyncWrap = new LdapAsyncWrap(hostAddress);

    ldapAsyncWrap.initialize()
    .then(() => {
      ldapAsyncWrap.bind(dn, noPass)
      .catch(() => {
        ldapAsyncWrap.compare(dn, attr, val)
        .catch((err) => {
          should.deepEqual(err.message, 'The Compare operation can be done just in BOUND state');
          next();
        })
      })
    })
 
  })

  it('should not compare if the client is unbound', (next) => {
    ldapAsyncWrap.unbind()
    .then(() => {
      ldapAsyncWrap.compare(dn, attr, val)
      .catch((err) => {
        should.deepEqual(err.message, 'The Compare operation can be done just in BOUND state');
        next();
      })
    })
  })

})