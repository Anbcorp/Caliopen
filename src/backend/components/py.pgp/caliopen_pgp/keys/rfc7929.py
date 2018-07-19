# -*- coding: utf-8 -*-
"""
Helpers for key discovery in DNS.

Relate to https://tools.ietf.org/html/rfc7929
"""

from __future__ import absolute_import, unicode_literals

import hashlib
import logging

from dnsknife import resolver

from .base import BaseDiscovery, DiscoveryResult

from caliopen_main.common.helpers.normalize import clean_email_address


log = logging.getLogger(__name__)


def compute_qname(username, domain):
    """Compute qname value from an email (part 3 of RFC)."""
    hash = hashlib.sha256()
    hash.update(username.lower())
    return '{}._openpgpkey.{}'.format(hash.hexdigest()[:56], domain.lower())


class DNSDiscovery(BaseDiscovery):
    """Class to discover OPENPGPKEY using Dns."""

    _types = ['email']

    def __init__(self, conf):
        self.default_name_server = conf.get('name_server')
        self.resolve_timeout = conf.get('timeout', 5)

    def lookup_identity(self, identity, type_):
        """Find for a given email an openpgp key in its DNS zone."""
        clean = clean_email_address(identity)
        local_part, domain = clean[0].split('@', 2)
        qname = compute_qname(local_part, domain)
        ns = resolver.ns_for(domain)
        if not ns:
            log.warn('No nameservers found for domain {}'.format(domain))
            return self.empty_result

        # XXX use a random one
        use_ns = ns[0]
        resolv = resolver.Resolver(timeout=self.resolve_timeout)
        # XXX use of dnssec validation
        query = resolv.query_at(qname, 'OPENPGPKEY', use_ns)
        response = query.get()
        if not response:
            log.warn('No response for OPENPGPKEY dns query')
            return self.empty_result
        rrsets = response.rrset
        if not rrsets:
            log.warn('No rrsets for OPENPGPKEY dns query')
            return self.empty_result
        # XXX many rrset, key and signature, must be considered
        key = self._extract_key(rrsets[0])
        keys = self._parse_key(key)
        return DiscoveryResult(keys)

    def _extract_key(self, record):
        """Extract an armored representation of key from dns record."""
        return record.data
