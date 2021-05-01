/**
 * Endpoint: GET /api/login?token=xxxxx
 * This endpoint is not to be used directly and is meant to to be targeted by
 * the magic link send as part of the login process.
 */

import apiLimiter from '../../core/backend/apiLimiter'
import uniqueVisitorId from '../../core/backend/uniqueVisitorId'
import accessToken from '../../core/backend/accessToken'
import initDB from '../../core/backend/DB'
import Daylog from '../../core/backend/DB/models/Daylog'
import nc from 'next-connect'
import ErrorCodes from '../../core/fullstack/ErrorCodes'
import Tools from '../../core/fullstack/Tools'
import JWT from '../../core/backend/JWT'




const handler = nc()
  .use(uniqueVisitorId)
  .use(apiLimiter)
  .use(accessToken)
  .use(initDB)
  .get(async (req, res) => {
    // The user data has been already fetched using the access token
    // by the 'accessToken' middleware.
    // It is available at req.user

    console.log('req.query: ', req.query)

    if (!req.query.username) {
      res.statusCode = 417
      return res.json({data: null, error: ErrorCodes.USERNAME_MISSING.code})
    }

    // if (!('year' in req.query && 'month' in req.query && 'day' in req.query)) {
    //   res.statusCode = 417
    //   return res.json({data: null, error: ErrorCodes.DATE_MISSING_ELEMENT.code})
    // }

    const username = req.query.username.trim().toLowerCase()

    // we are looking for a particular day
    if (req.query.year && req.query.month && req.query.day) {
      
      // make sure it's a valid date
      if (isNaN(Date.parse(`${req.query.year}-${req.query.month}-${req.query.day}`))) {
        res.statusCode = 417
        return res.json({data: null, error: ErrorCodes.DATE_INVALID_FORMAT.code})
      }

      // getting the daylog
      const daylog = await Daylog.findByUsernameAndDay(username, req.query.year, req.query.month, req.query.day)

      if (!daylog) {
        res.statusCode = 200
        return res.json({data: null, error: null})
      }

      if (!daylog.isPublic && req.user.username !== username) {
        res.statusCode = 403
        return res.json({data: null, error: ErrorCodes.DAYLOG_UNAUTHORIZED.code})
      }

      res.statusCode = 200
      return res.json({data: daylog.strip(), error: null})

    } else 
    // we want all the daylogs of a given month (on a given year)
    if (req.query.year && req.query.month) {
      const daylogs = await Daylog.listByUsernameAndMonth(username, req.query.year, req.query.month)
      res.statusCode = 200
      return res.json({data: daylogs, error: null})
    }

    res.statusCode = 417
    return res.json({data: null, error: ErrorCodes.DATE_MISSING_ELEMENT.code})
  })


  .post(async (req, res) => {
    // The user data has been already fetched using the access token
    // by the 'accessToken' middleware.
    // It is available at req.user

    if (!req.body) {
      res.statusCode = 417
      return res.json({data: null, error: ErrorCodes.MISSING_DATA_FOR_UPDATING.code})
    }

    if (typeof req.body !== 'object') {
      res.statusCode = 417
      return res.json({data: null, error: ErrorCodes.WRONG_DATA_FORMAT.code})
    }

    if (!('year' in req.body && 'month' in req.body && 'day' in req.body)) {
      res.statusCode = 417
      return res.json({data: null, error: ErrorCodes.DATE_MISSING_ELEMENT.code})
    }

    if (isNaN(Date.parse(`${req.body.year}-${req.body.month}-${req.body.day}`))) {
      res.statusCode = 417
      return res.json({data: null, error: ErrorCodes.DATE_INVALID_FORMAT.code})
    }

    try {
      // trying to get an existing username + date
      let daylog = await Daylog.findByUsernameAndDay(req.user.username, req.body.year, req.body.month, req.body.day)

      // if not found, then init a new one
      if (!daylog) {
        daylog = new Daylog({
          username: req.user.username,
          year: req.body.year,
          month: req.body.month,
          day: req.body.day
        })
      }

      daylog.text = req.body.text

      await daylog.save()
    } catch (e) {
      res.statusCode = 500
      console.log(e)
      return res.json({data: null, error: ErrorCodes.DATABASE_UPDATE_ERROR.code})
    }

    res.statusCode = 200
    return res.json({data: 'Daylog updated', error: null})
  })


export default handler