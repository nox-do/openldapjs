'use strict';

const LdapError = require('./ldap_error');
const OperationalError = require('./operational_error');


class LdapObjectClassModsError extends OperationalError {

  static get code() {
    return 69;
  }

  get description() {
    return 'Indicates that the modify operation attempted to modify the structure rules of an object class.';
  }

  get code() {
    return LdapObjectClassModsError.code;
  }


}

module.exports = LdapObjectClassModsError;
