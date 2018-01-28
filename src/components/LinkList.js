/* eslint-disable react/prop-types */
import React, { Component } from 'react'

import Link from './Link'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class LinkList extends Component {
  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>
    }

    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>
    }

    const linksToRender = this.props.feedQuery.feed.links

    return <div>{linksToRender.map(link => <Link key={link.id} link={link} />)}</div>
  }
}

const FEED_QUERY = gql`
  # 2
  query FeedQuery {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`
// options { name: 'feedQuery' } will be shown in resp instead of 'data'
export default graphql(FEED_QUERY, { name: 'feedQuery' })(LinkList)
