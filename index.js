'use strict';

const universalAnalytics = require('universal-analytics');
const StatsD = require('node-statsd');

const statsd = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: process.env.STATSD_PORT || 8125,
  prefix: process.env.STATSD_PREFIX || 'turbasen.',
});

module.exports = () => (req, res, next) => {
  try {
    const ua = universalAnalytics(process.env.GA_ID);
    const requestParams = module.exports.getRequestParams(req);
    ua.pageview(requestParams).send((err) => {
      if (err) {
        throw new Error(err);
      }
    });

    statsd.increment('http.request.count');

    if (req.user.type === 'token') {
      statsd.increment(`http.request.count.${req.user.app}`.toLowerCase());
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  } finally {
    next();
  }
};

module.exports.getRequestParams = function getParams(req) {
  const gaParams = {
    // GA version
    v: 1,
    // Document Path
    dp: req.path.replace(/\/$/, ''),
    // Content Group 1
    cg1: req.path.split('/').find(str => str.length > 0),
    // Custom dimension 1: Collection
    cd1: req.path.split('/').find(str => str.length > 0),
    // Custom dimension 2: Query params
    cd2: req.originalUrl.split('?')[1],
    // Custom metric 1: RateLimit usage in percent
    cm1: parseInt((100 - ((req.user.remaining / req.user.limit) * 100)), 10),
  };

  if (req.user.type === 'token') {
    Object.assign(gaParams, {
      uid: req.user.provider,
      cid: req.user.provider,
      an: req.user.app,
      aid: req.user._id, // eslint-disable-line no-underscore-dangle
    });
  } else if (req.user.type === 'ip') {
    // Don't add any details for anonymous users
  }

  return gaParams;
};

module.exports.middleware = module.exports();
