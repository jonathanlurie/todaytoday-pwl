import React from 'react'
import { withRouter } from 'next/router'
import Head from 'next/head'
import Marked from 'marked'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import User from '../../../core/backend/DB/models/User'
import Daylog from '../../../core/backend/DB/models/Daylog'
import ErrorCodes from '../../../core/fullstack/ErrorCodes'
import { Button, Space, Col, Row, Divider } from 'antd'
import { FrownOutlined, GlobalOutlined, TwitterOutlined, InstagramOutlined, GithubOutlined } from '@ant-design/icons'
import TokenizedPage from '../../../components/TokenizedPage'
import AppLayout from '../../../components/AppLayout'
import ProfilePicture from '../../../components/ProfilePicture'
import initDB from '../../../core/backend/DB'
import Styles from './styles.module.css'
import DaylogYearlyCalendar from '../../../components/DaylogYearlyCalendar'
// const { TextArea } = Input


class UserPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this._htmlDivRef = React.createRef()
  }


  render() {
    const router = this.props.router
    const { username } = router.query
    const data = this.props.data
    const error = this.props.error
    const pictureSize = 200
    let content = null

    console.log('this.props: ', this.props)

    if (error) {
      content =  (
        <Space direction='vertical' className={Styles['spacer']}>
        <div className={Styles['error-div']}>
          <p>
            {error.message}
          </p>
          <p>
            <FrownOutlined/>
          </p>
        </div>
        </Space>
      )
    } else {

      content = (
        <div className={Styles['content']}>
          <Row gutter={[8, 8]} justify='center'>
            <Col>
              <ProfilePicture img={data.user.picture} />
            </Col>
          </Row>

          <Row justify='center'>
            <Col className={Styles['display-name']}>
              {data.user.displayName ? data.user.displayName : data.user.username}
            </Col>
            
          </Row>
          <Row justify='center'>
            <Col className={Styles['username']}>
              {`@${data.user.username}`}
            </Col>
          </Row>

          <DaylogYearlyCalendar/>

          <Divider>
            <Space>
              {
                data.user.instagramUsername
                ?
                <Button type='primary' size='small' shape="circle" icon={<InstagramOutlined />} href={`https://instagram.com/${data.user.instagramUsername}`}/>
                :
                null
              }

              {
                data.user.githubUsername
                ?
                <Button type='primary' size='small' shape="circle" icon={<GithubOutlined />} href={`https://github.com/${data.user.githubUsername}`}/>
                :
                null
              }

              {
                data.user.twitterUsername
                ?
                <Button type='primary' size='small' shape="circle" icon={<TwitterOutlined />} href={`https://twitter.com/${data.user.twitterUsername}`}/>
                :
                null
              }

              {
                data.user.website
                ?
                <Button type='primary' size='small' shape="circle" icon={<GlobalOutlined />} href={data.user.website}/>
                :
                null
              }
            </Space>
          </Divider>
          {/*
            data.user.text
            ?
            <div
              className={Styles['long-text']}
              ref={this._htmlDivRef} dangerouslySetInnerHTML={{ __html: data.user.text }}
            />
            :
            <div
              className={Styles['no-text']}
            >
              {data.user.displayName ? data.user.displayName : data.user.username} did not write anything yet.
            </div>
          */}
          
        </div>
      )
    }

    return (
      <TokenizedPage>
        <AppLayout>
          <Head>
            <title>Passwordless Next.js</title>
            <link rel="shortcut icon" href="/favicon.ico" />

            <meta name="description" content={`${data.user.displayName ? data.user.displayName : data.user.username} profile on Paswordless Next.js`}/>
            <meta name="author" content={data.user.displayName ? data.user.displayName : data.user.username}/>

            <meta property="og:title" content='Passwordless Next.js' key="title_OG" />
            {/* <meta property="og:url" content={`${process.env.}`} key="url_OG"/> */}
            <meta property="og:image" content='/images/social_cover.png' key="image_OG"/>
            <meta property="og:description" content={`${data.user.displayName ? data.user.displayName : data.user.username} profile on Paswordless Next.js`} key="description_OG"/>
            <meta property="og:site_name" content="Passwordless Nextjs" key="sitename_OG"/>
            <meta property="og:type" content="article" key="type_OG"/>

            <meta name="twitter:title" content='Passwordless Next.js' key="title_TW"/>
            <meta name="twitter:description" content={`${data.user.displayName ? data.user.displayName : data.user.username} profile on Paswordless Next.js`} key="description_TW"/>
            <meta name="twitter:image" content='/images/social_cover.png' key="image_TW"/>
            <meta name="twitter:card" content="summary_large_image" key="card_TW"/>
            <meta name="twitter:site" content="@jonathanlurie" key="site_TW"/>
          </Head>
            {content}
        </AppLayout>
      </TokenizedPage>
    )
  }
}


export async function getServerSideProps(context) {
  const urlQuery = context.query
  let username = urlQuery.username
  let date = urlQuery.date




  // if the username does not start with @, then redurect to same page
  // but with @ prepended
  if (!username.startsWith('@')) {
    console.log('username doesnt start with @. Prepend a @ and redirect...')
    context.res.setHeader('location', `/@${username}`)
    context.res.statusCode = 302
    context.res.end()
    return {props:{}}
  }

  // the username is missing and there is only @ in the URL,
  // redirecting to /
  if (username === '@') {
    console.log('Username is only @, this is invalid. Redirect to /')
    context.res.setHeader('location', '/')
    context.res.statusCode = 302
    context.res.end()
    return {props:{}}
  }

  // check if date has a proper format. We could imagine a date that parses well
  // with the Daet constructor but that wouldnt be shape as YYYY-MM-DD
  const year = date.slice(0, 4)
  const month = date.slice(5, 7)
  const day = date.slice(8, 10)
  date = `${year}-${month}-${day}`
  
  if (isNaN(Date.parse(date))) {
    console.log('Date is invalid. Redirect to /@username')
    context.res.setHeader('location', `/${username}`)
    context.res.statusCode = 302
    context.res.end()
    return {props:{}}
  }

  console.log('Username format OK. Looking into DB...')
  // remove the @ from username
  username = username.slice(1)


  // check if the username exists in the DB
  await initDB()
  const user = await User.findByUsername(username)

  // return props with error code if the user does not exist
  if (!user) {
    context.res.setHeader('location', `/error?error=${ErrorCodes.USERNAME_NOT_EXISTING.code}`)
    context.res.statusCode = 302
    context.res.end()
    return {props:{}}
  }

  console.log('User found in DB. Stripping private data.user...')

  // strip user from some props we dont want to propate to frontend:
  const userObj = user.toObject({flattenMaps: true, versionKey: false})
  delete userObj._id
  delete userObj.email // since this would make it visible to bots
  delete userObj.isAdmin
  delete userObj.text

  // convert markdown to html on server side
  // in order to benefit from SEO if necessary.
  // If SEO doe not matter, it's probably better to do it all
  // on client and not use getServerSideProps at all.
  // console.log('Converting markdown article to HTML...')
  // userObj.text = mdToHtml(userObj.text)
  // console.log('Done.')


  // get the daylog
  let daylog = await Daylog.findByUsernameAndDay(username, year, month, day)

  if (!daylog) {
    context.res.setHeader('location', `/error?error=${ErrorCodes.DAYLOG_INEXISTING.code}`)
    context.res.statusCode = 302
    context.res.end()
    return {props:{}}
  }

  if (!daylog.isPublic) {
    context.res.setHeader('location', `/error?error=${ErrorCodes.DAYLOG_UNAUTHORIZED.code}`)
    context.res.statusCode = 302
    context.res.end()
    return {props:{}}
  }

  // making the daylog object more suitable for frontend consumption
  daylog = daylog.strip()
  daylog.text = mdToHtml(daylog.text)

  return {
    props: {
      error: null,
      data: {
        daylog,
        user: userObj,
      },
    },
  }
}


function mdToHtml(md) {
  if (!md) {
    return ''
  }

  const { window } = new JSDOM('<!DOCTYPE html>')
  const domPurify = DOMPurify(window)
  return domPurify.sanitize(Marked(md), { ADD_TAGS: ["iframe"] })
}




export default withRouter(UserPage)