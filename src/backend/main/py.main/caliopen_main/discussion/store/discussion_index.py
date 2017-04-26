# -*- coding: utf-8 -*-
"""Caliopen disccions index classes.

Discussions are not really indexed, they are result of messages aggregations.

So there is not direct document mapping, only helpers to find discussions
and build a suitable representation for displaying.

"""
from __future__ import absolute_import, print_function, unicode_literals
import logging

import elasticsearch_dsl as dsl
from caliopen_storage.store.model import BaseIndexDocument
from caliopen_main.message.store.message_index import IndexedMessage

log = logging.getLogger(__name__)


class DiscussionIndex(object):
    """Informations from index about a discussion."""

    total_count = 0
    unread_count = 0
    attachment_count = 0
    last_message = None

    def __init__(self, id):
        self.discussion_id = id


class DiscussionIndexManager(object):
    """Manager for building discussions from index storage layer."""

    def __init__(self, user_id):
        self.index = user_id
        self.proxy = BaseIndexDocument.client()

    def _prepare_search(self, min_pi, max_pi):
        """Prepare a dsl.Search object on current index."""
        search = IndexedMessage.search(using=self.proxy,
                                       index=self.index)
        # TODO : pi management
        # search = search.filter('range', **{'privacy_index': {'gte': min_pi}})
        # search = search.filter('range', **{'privacy_index': {'lte': max_pi}})
        return search

    def __search_ids(self, limit, offset, min_pi, max_pi):
        """Search discussions ids as a bucket aggregation."""
        search = self._prepare_search(min_pi, max_pi)
        # Do bucket term aggregation, sorted by last_message date
        size = offset + (limit * 2)
        agg = dsl.A('terms', field='discussion_id',
                    order={'last_message': 'desc'}, size=size, shard_size=size)
        search.aggs.bucket('discussions', agg).metric('last_message', 'max',
                                                      field='date')
        # XXX add sorting on message date_insert
        log.debug('Search is {}'.format(search.to_dict()))
        result = search.execute()
        if hasattr(result, 'aggregations'):
            # Something found
            buckets = result.aggregations.discussions.buckets
            # XXX Ugly but don't find a way to paginate on bucket aggregation
            buckets = buckets[offset:offset + limit]
            total = result.aggregations.discussions.sum_other_doc_count
            # remove last_message for now as it doesn't have relevant attrs
            for discussion in buckets:
                del discussion["last_message"]
            return buckets, total
        log.debug('No result found on index {}'.format(self.index))
        return {}, 0

    def get_last_message(self, discussion_id, min_pi, max_pi):
        """Get last message of a given discussion."""
        search = self._prepare_search(min_pi, max_pi)
        search = search.filter('match', **{'discussion_id': discussion_id})
        search = search.sort('-date_insert')
        search = search[0:1]
        result = search.execute()
        if not result.hits:
            # XXX what to do better if not found ?
            return {}
        return result.hits[0]

    def list_discussions(self, limit=10, offset=0, min_pi=0, max_pi=0):
        """Build a list of limited number of discussions."""
        list, total = self.__search_ids(limit, offset, min_pi, max_pi)
        discussions = []
        for discus in list:
            message = self.get_last_message(discus['key'], min_pi, max_pi)
            discussion = DiscussionIndex(discus['key'])
            discussion.total_count = discus['doc_count']
            discussion.last_message = message
            # XXX build others values from index
            discussions.append(discussion)
        # XXX total do not work completly, hack a bit
        return discussions, total + len(discussions)

    def get_message_id(self, discussion_id, message_id):
        """Search a message_id within a discussion"""

        search = self._prepare_search(0, 100)
        search.body = {"query": {"match_all":
                                     {"discussion_id": discussion_id,
                                      "message_id": message_id}}}
        result = search.execute()
        if not result.hits:
            return None
        return result.hits[0]