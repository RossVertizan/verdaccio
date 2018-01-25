import request from 'supertest';
import _ from 'lodash';
import path from 'path';
import rimraf from 'rimraf';

import configDefault from '../partials/config';
import Config from '../../../src/lib/config';
import Storage from '../../../src/lib/storage';
import Auth from '../../../src/lib/auth';
import indexAPI from '../../../src/api/index';

require('../../../src/lib/logger').setup([]);

describe('endpoint unit test', () => {
  let config;
  let storage;
  let auth;
  let app;
  jest.setTimeout(500000);

  beforeAll(function(done) {
    const store = path.join(__dirname, '../partials/store/test-storage');
    rimraf(store, () => {
      const configForTest = _.clone(configDefault);
      configForTest.auth = {
        htpasswd: {
          file: './test-storage/htpasswd-test'
        }
      };
      configForTest.self_path = store;
      config = new Config(configForTest);
      storage = new Storage(config);
      auth = new Auth(config);
      app = indexAPI(config, auth, storage);
      done();
    });
  });

  describe('should test ping api', () => {
    test('should test endpoint /-/ping', (done) => {
      request(app)
        .get('/-/ping')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });
  });

  describe('should test whoami api', () => {
    test('should test /-/whoami endpoint', (done) => {
      request(app)
        .get('/-/whoami')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    test('should test /whoami endpoint', (done) => {
      request(app)
        .get('/-/whoami')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });
  });

  describe('should test user api', () => {
    const credentials = { name: 'Jota', password: 'secretPass' };

    test('test add a new user', (done) => {


      request(app)
        .put('/-/user/org.couchdb.user:jota')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body.ok).toBeDefined();
          expect(res.body.ok).toMatch(`user '${credentials.name}' created`);
          done();
        });
    });

    test('test fails add a new user', (done) => {

      request(app)
        .put('/-/user/org.couchdb.user:jota')
        .send(credentials)
        .expect('Content-Type', /json/)
        .expect(409)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.body.error).toBeDefined();
          expect(res.body.error).toMatch(/this user already exists/);
          done();
        });
    });

  });

});
