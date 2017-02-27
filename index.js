'use strict';

const UniversalAnalytics = require('universal-analytics');

module.exports = () => (req, res, next) => {
  try {
    const ua = UniversalAnalytics(process.env.GA_ID);
    const requestParams = module.exports.getRequestParams(req);
    ua.pageview(requestParams).send((err) => {
      if (err) {
        throw new Error(err);
      }
    });
  } catch (err) {
    console.error(err);
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
    cm1: req.user.remaining / req.user.limit * 100,
  };

  if (req.user.type === 'token') {
    Object.assign(gaParams, {
      uid: req.user.provider,
      an: req.user.app,
      aid: req.user._id,
    });
  } else if (req.user.type === 'ip') {
    // Don't add any details for anonymous users
  }

  return gaParams;
};

module.exports.middleware = module.exports();
