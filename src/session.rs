use crate::data::steam_id::SteamId;
use crate::data::user::User;
use crate::{App, Result};
use async_session::SessionStore as _;
use axum::extract::{FromRef, FromRequestParts};
use axum::http::request::Parts;
use axum::{async_trait, headers::Cookie, RequestPartsExt, TypedHeader};
use std::convert::Infallible;
use std::sync::Arc;
use tracing::debug;

pub const COOKIE_NAME: &str = "tf_session";

#[derive(Debug)]
pub enum SessionData {
    Authenticated(User),
    UnAuthenticated,
}

impl SessionData {
    pub fn token(&self) -> Option<String> {
        match self {
            SessionData::Authenticated(user) => Some(user.token.clone()),
            SessionData::UnAuthenticated => None,
        }
    }
    pub fn steam_id(&self) -> Option<SteamId> {
        match self {
            SessionData::Authenticated(user) => Some(user.steam_id.clone()),
            SessionData::UnAuthenticated => None,
        }
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for SessionData
where
    Arc<App>: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = Infallible;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app: Arc<App> = Arc::from_ref(state);
        let store = &app.session_store;

        let cookie: Option<TypedHeader<Cookie>> = parts.extract().await.unwrap();

        let session_cookie = cookie.as_ref().and_then(|cookie| cookie.get(COOKIE_NAME));

        // return the new created session cookie for client
        if session_cookie.is_none() {
            return Ok(Self::UnAuthenticated);
        }

        debug!(
            "SessionData: got session cookie from user agent, {}={}",
            COOKIE_NAME,
            session_cookie.unwrap()
        );
        // continue to decode the session cookie
        let Ok(Some(session)) = store.load_session(session_cookie.unwrap().to_owned()).await else {
            return Ok(Self::UnAuthenticated);
        };
        let Some(user) = session.get::<User>("user") else {
            return Ok(Self::UnAuthenticated);
        };

        Ok(Self::Authenticated(user))
    }
}
