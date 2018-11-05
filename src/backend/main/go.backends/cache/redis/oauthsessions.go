// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package cache

import (
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"time"
)

const (
	oauthSessionPrefix = "oauthsession::"
	oauthSessionTTL    = 10 // ttl in minutes
)

// GetOauthSession unmarshal json found at `key`, if any, into an OauthSession struct
func (cache *RedisBackend) GetOauthSession(key string) (session *OauthSession, err error) {
	session_str, err := cache.client.Get(oauthSessionPrefix + key).Bytes()
	if err != nil {
		return nil, err
	}
	session = &OauthSession{}
	err = json.Unmarshal(session_str, session)
	if err != nil {
		return nil, err
	}
	return
}

// SetOauthSession put `OauthSession` as a json string at `key` prefixed with oauthSessionPrefix
func (cache *RedisBackend) SetOauthSession(key string, session *OauthSession) (err error) {
	ttl := oauthSessionTTL * time.Minute
	session_str, err := json.Marshal(session)
	if err != nil {
		return err
	}

	_, err = cache.client.Set(oauthSessionPrefix+key, session_str, ttl).Result()
	if err != nil {
		return err
	}

	return nil
}

// DeleteOauthSession deletes value found at `key` prefixed with oauthSessionPrefix
func (cache *RedisBackend) DeleteOauthSession(key string) error {
	_, err := cache.client.Del(oauthSessionPrefix + key).Result()
	if err != nil {
		return err
	}
	return nil
}
