import mongoose from 'mongoose'
import validator from 'validator'
import Tools from '../../../fullstack/Tools'


function init() {
  const daylogSchema = mongoose.Schema({
    username: {
      index: true,
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: value => Tools.isUsername(value)
    },

    year: {
      index: true,
      type: Number,
    },

    month: {
      index: true,
      type: Number,
    },

    day: {
      index: true,
      type: Number,
    },

    isPublic: {
      type: Boolean,
      default: false,
      required: false,
    },

    text: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },

  })

  // only a post per day per user is allowed
  daylogSchema.index({ username: 1, year: 1, month: 1, day: 1 }, { unique: true })

  daylogSchema.methods.updateText = async function(text = null) {
    const daylog = this
    daylog.text = text
    await daylog.save()
  }


  daylogSchema.methods.updateIsPublic = async function(isPublic = false) {
    const daylog = this
    daylog.isPublic = isPublic
    await daylog.save()
  }


  // turn the model into a plain JS object without MongoDB _props
  daylogSchema.methods.strip = function() {
    const obj = this.toObject({flattenMaps: true, versionKey: false})
    delete obj._id
    return obj
  }



  daylogSchema.statics.findByUsernameAndDay = async function(username, year, month, day) {
    // Search for a user by username.
    try {
      const daylog = await Daylog.findOne({ username, year, month, day })
      if (!daylog) {
        console.log(`No daylog found with the username ${username} for the ${year}-${month}-${day}`)
          return null
      }
      return daylog
    } catch(err) {
      console.log(err)
      return null
    }
  }


  /**
   * List the daylogs for a given user:year:month, does not fetch the text content
   * @param {*} username 
   * @param {*} year 
   * @param {*} month 
   * @returns 
   */
  daylogSchema.statics.listByUsernameAndMonth = async function(username, year, month) {
    let daylogs = await Daylog.find({ username, year, month }, '-text')
    daylogs = daylogs.map((dl) => {
      const strippedDl = dl.toObject({flattenMaps: true, versionKey: false})
      delete strippedDl._id
      return strippedDl
    })
    
    return daylogs
  }


  daylogSchema.statics.listByUsernameAndYear = async function(username, year) {
    let daylogs = await Daylog.find({ username, year }, '-text')
    daylogs = daylogs.map((dl) => {
      const strippedDl = dl.toObject({flattenMaps: true, versionKey: false})
      delete strippedDl._id
      return strippedDl
    })
    
    return daylogs
  }


  const Daylog = mongoose.model('Daylog', daylogSchema)
}





if (!process.browser && !mongoose.models.Daylog) {
  init()
}

export default (mongoose.models ? mongoose.models.Daylog : null)

