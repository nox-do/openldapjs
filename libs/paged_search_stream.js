'use strict';

const Readable = require('stream').Readable;
const errorHandler = require('./errors/error_dispenser').errorFunction;
const errorList = require('../test/error_list.json');
const ldif = require('ldif');

/**
 * @class PagedSearchStream
 * class that extends the readable stream class
 */
class PagedSearchStream extends Readable {

  /**
   *
   * @param {String} base the base for the search.
   * @param {unsigned int} scope scope for the search, can be 0(BASE), 1(ONE) or
   * 2(SUBTREE)
   * @param {String} filter search filter.
   * @param {unsigned int} pageSize number of results displayed per page.
   * @param {unsigned int} searchId unique search id.
   * @param {Object} ldapInstance the ldap instance the search belongs to.
   */
  constructor(base, scope, filter, pageSize, searchId, ldapInstance, timeOut) {
    super();
    this.objectMode = true;
    this._binding = ldapInstance;
    this._base = base;
    this._scope = scope;
    this._filter = filter;
    this._pageSize = pageSize;
    this._searchId = searchId;
    this._lastResult = false;
    this._timeOut = timeOut;
  }

  _read() {
    if (this._lastResult) {
      this.push(null);
    } else {
      this._binding.pagedSearch(
        this._base, this._scope, this._filter, this._pageSize, this._searchId, this._timeOut,
        (err, page, morePages) => {
          if (err) {
            const CustomError = errorHandler(err);
            this.emit('err', new CustomError(errorList.ldapSearchErrorMessage));
            this.push(null);
          } else {
            if (!morePages) this._lastResult = true;
            const resJSON = page.length === 0 ? page : ldif.parse(page);
            this.push(JSON.stringify(resJSON));
          }

        });
    }
  }

}
module.exports = PagedSearchStream;
