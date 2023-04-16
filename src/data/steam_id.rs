use maud::Render;
use sea_query::Value;
use serde::{Deserialize, Serialize};
use sqlx::database::HasValueRef;
use sqlx::error::BoxDynError;
use sqlx::{Database, Decode, Type};
use std::borrow::Cow;
use std::convert::Infallible;
use std::fmt::{Debug, Formatter};
use std::fmt::{Display, Write};
use std::str::FromStr;
use steamid_ng::SteamID;

#[derive(Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SteamId {
    Id(u64),
    Raw(Cow<'static, str>),
}

const UNKNOWN_STEAM_ID: SteamId = SteamId::Raw(Cow::Borrowed("unknown"));

impl Default for SteamId {
    fn default() -> Self {
        UNKNOWN_STEAM_ID
    }
}

impl Default for &SteamId {
    fn default() -> Self {
        &UNKNOWN_STEAM_ID
    }
}

impl SteamId {
    pub const fn new(id: u64) -> SteamId {
        SteamId::Id(id)
    }

    pub fn steam3(&self) -> String {
        match self {
            SteamId::Id(id) => SteamID::from(*id).steam3(),
            SteamId::Raw(raw) => raw.to_string(),
        }
    }

    pub fn steam2(&self) -> String {
        match self {
            SteamId::Id(id) => SteamID::from(*id).steam2(),
            SteamId::Raw(raw) => raw.to_string(),
        }
    }

    pub fn from_steam3(s: &str) -> Result<Self, steamid_ng::SteamIDError> {
        let id = SteamID::from_steam3(s)?;
        Ok(SteamId::Id(id.into()))
    }

    pub fn steamid64(&self) -> String {
        match self {
            SteamId::Id(id) => format!("{}", id),
            SteamId::Raw(raw) => raw.to_string(),
        }
    }
}

impl Debug for SteamId {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            SteamId::Id(id) => Debug::fmt(&SteamID::from(*id), f),
            SteamId::Raw(raw) => Debug::fmt(raw, f),
        }
    }
}

impl<DB: Database> Type<DB> for SteamId
where
    i64: Type<DB>,
    str: Type<DB>,
{
    fn type_info() -> DB::TypeInfo {
        <str as Type<DB>>::type_info()
    }

    fn compatible(ty: &DB::TypeInfo) -> bool {
        <str as Type<DB>>::compatible(ty)
    }
}

impl<'r, DB> Decode<'r, DB> for SteamId
where
    DB: Database,
    &'r str: Decode<'r, DB>,
{
    fn decode(value: <DB as HasValueRef<'r>>::ValueRef) -> Result<Self, BoxDynError> {
        let str = <&str as Decode<DB>>::decode(value)?;
        Ok(str.parse().unwrap())
    }
}

impl Display for SteamId {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            SteamId::Id(id) => write!(f, "{id}"),
            SteamId::Raw(raw) => write!(f, "{raw}"),
        }
    }
}

impl Render for SteamId {
    fn render_to(&self, buffer: &mut String) {
        write!(buffer, "{self}").unwrap()
    }
}

pub struct ProfileLink<'a>(&'a SteamId);

impl Render for ProfileLink<'_> {
    fn render_to(&self, buffer: &mut String) {
        buffer.push_str("/profiles/");
        self.0.render_to(buffer)
    }
}

pub struct UploadsLink<'a>(&'a SteamId);

impl Render for UploadsLink<'_> {
    fn render_to(&self, buffer: &mut String) {
        buffer.push_str("/uploads/");
        self.0.render_to(buffer)
    }
}

impl SteamId {
    pub fn uploads_link(&self) -> UploadsLink {
        UploadsLink(self)
    }

    pub fn profile_link(&self) -> ProfileLink {
        ProfileLink(self)
    }
}

impl FromStr for SteamId {
    type Err = Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if let Ok(id) = s.parse() {
            Ok(Self::Id(id))
        } else if s == "serveme.tf" {
            Ok(Self::Raw("serveme.tf".into()))
        } else if s == "essentialstf" {
            Ok(Self::Raw("essentialstf".into()))
        } else {
            Ok(Self::Raw(s.to_string().into()))
        }
    }
}

impl From<SteamId> for Value {
    fn from(value: SteamId) -> Self {
        Value::String(Some(Box::new(value.steamid64())))
    }
}

impl From<&SteamId> for Value {
    fn from(value: &SteamId) -> Self {
        Value::String(Some(Box::new(value.steamid64())))
    }
}
