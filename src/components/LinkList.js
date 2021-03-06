/* eslint-disable react/prop-types */
import React, { Component } from 'react'

import Link from './Link'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class LinkList extends Component {
  componentDidMount() {
    this._subscribeToNewLinks()
    this._subscribeToNewVotes()
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    // 1
    const data = store.readQuery({ query: FEED_QUERY })

    // 2
    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes

    // 3
    store.writeQuery({ query: FEED_QUERY, data })
  }

  _subscribeToNewLinks = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newLink {
            node {
              id
              url
              description
              createdAt
              postedBy {
                id
                name
              }
              votes {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `,
      // INFO: Works as Redux reducer, takes state and update function that returns the new state
      updateQuery: (previous, { subscriptionData }) => ({
        ...previous,
        feed: {
          links: [ subscriptionData.data.newLink.node, ...previous.feed.links ]
        }
      })
    })
  }

  _subscribeToNewVotes = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newVote {
            node {
              id
              link {
                id
                url
                description
                createdAt
                postedBy {
                  id
                  name
                }
                votes {
                  id
                  user {
                    id
                  }
                }
              }
              user {
                id
              }
            }
          }
        }
      `,
      // INFO: Same as above ☝️ but here we do not need to use subscriptionData.data.newVote.node.link.id
      // INFO: There is a bug in resolvers/Subscription.js (server-side) and "where clause is disabled"
      // eslint-disable-next-line
      updateQuery: (previous, data) => ({
        ...previous,
        allLinks: previous.feed.links.slice()
      })
    })
  }

  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>
    }

    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>
    }

    const linksToRender = this.props.feedQuery.feed.links

    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link key={link.id} index={index} link={link} updateStoreAfterVote={this._updateCacheAfterVote} />
        ))}
      </div>
    )
  }
}

export const FEED_QUERY = gql`
  # 2
  query FeedQuery {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`
// options { name: 'feedQuery' } will be shown in resp instead of 'data'
export default graphql(FEED_QUERY, { name: 'feedQuery' })(LinkList)
