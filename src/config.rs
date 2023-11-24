use crate::Result;
use config::{Environment, File};
use serde::Deserialize;
use serde_env::from_env;
use sqlx::postgres::PgConnectOptions;
use sqlx::PgPool;
use std::net::IpAddr;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub listen: Listen,
    pub database: DbConfig,
    pub site: SiteConfig,
}

impl Config {
    pub fn load(path: &str) -> Result<Self> {
        let s = config::Config::builder()
            .add_source(File::with_name(path))
            .add_source(Environment::default().separator("_"))
            .build()?;

        Ok(s.try_deserialize()?)
    }

    pub fn env() -> Option<Self> {
        from_env().ok()
    }
}

#[derive(Debug, Deserialize)]
pub struct DbConfig {
    hostname: String,
    username: String,
    password: String,
}

impl DbConfig {
    pub async fn connect(&self) -> Result<PgPool> {
        let opt = PgConnectOptions::new()
            .host(&self.hostname)
            .username(&self.username)
            .password(&self.password);
        Ok(PgPool::connect_with(opt).await?)
    }
}

#[derive(Debug, Deserialize)]
pub struct RawListen {
    path: Option<PathBuf>,
    address: Option<IpAddr>,
    port: Option<u16>,
}

impl TryFrom<RawListen> for Listen {
    type Error = &'static str;

    fn try_from(value: RawListen) -> std::result::Result<Self, Self::Error> {
        match (value.path, value.address, value.port) {
            (Some(path), None, None) => Ok(Listen::Socket { path }),
            (None, Some(address), Some(port)) => Ok(Listen::Tcp { address, port }),
            _ => Err("invalid listen section"),
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(try_from = "RawListen")]
pub enum Listen {
    Socket { path: PathBuf },
    Tcp { address: IpAddr, port: u16 },
}

#[derive(Debug, Deserialize)]
pub struct SiteConfig {
    pub url: String,
    #[serde(default = "default_api")]
    pub api: String,
    #[serde(default = "default_maps")]
    pub maps: String,
}

fn default_api() -> String {
    "https://api.demos.tf/".into()
}

fn default_maps() -> String {
    "https://maps.demos.tf/".into()
}
