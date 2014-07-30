var expect = require('chai').expect;
var request = require('superagent');
var uri = 'http://localhost:5353';

describe('Login component', function() {
  it('should return expected HTML', function(end) {
    request
      .get(uri + '/login')
      .end(function(err, res) {
        expect(err).to.not.be.ok;
        expect(res.statusCode).to.equal(200);

        end();
      });
  });
});

describe('Tasker component', function() {
  it('should return expected HTML', function(end) {
    request
      .get(uri)
      .end(function(err, res) {
        expect(err).to.not.be.ok;
        expect(res.statusCode).to.equal(200);

        end();
      });
  });
});