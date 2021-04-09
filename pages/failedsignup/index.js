import React from 'react'
import { withRouter } from 'next/router'
import { getMessageFromCode }  from '../../core/fullstack/ErrorCodes'


class FailedSignupPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }


  render() {
    // in case we need a message or error code, it could be in the URL
    const query = this.props.router.query
    const message = getMessageFromCode(query.error)

    return (
      <div>
        <h1>The signup failed :(</h1>
        <p>
          {message}
        </p>
      </div>
    )
  }
}

export default withRouter(FailedSignupPage)