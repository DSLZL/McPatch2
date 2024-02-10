use std::path::PathBuf;

use clap::Parser;
use clap::Subcommand;

use crate::subcommand::check::do_check;
use crate::subcommand::combine::do_combine;
use crate::subcommand::pack::do_pack;
use crate::subcommand::test::do_test;
use crate::utility::is_running_under_cargo;

pub mod diff;
pub mod utility;
pub mod data;
pub mod subcommand;
pub mod common;

#[derive(Parser)]
struct CommandLineInterface {
    // #[arg(long, action = clap::ArgAction::Count)]
    // json_mode: u8,

    #[command(subcommand)]
    command: Commands
}

#[derive(Subcommand)]
enum Commands {
    /// 打包一个新的版本
    Pack {
        /// 指定新的版本号
        version_label: String
    },
    /// 检查工作空间的文件修改情况
    Check,
    /// 合并更新包
    Combine {
        /// 指定新的版本号
        new_label: String,
    },
    /// 测试所有更新包是否能正常读取
    Test,
}

pub struct AppContext {
    pub working_dir: PathBuf,
    pub workspace_dir: PathBuf,
    pub public_dir: PathBuf,
    pub combine_dir: PathBuf,
    pub index_file_official: PathBuf,
    pub index_file_internal: PathBuf,
    pub ignores_file: PathBuf,
}

impl AppContext {
    pub fn new() -> Self {
        let mut working_dir = std::env::current_dir().unwrap();
        
        if is_running_under_cargo() {
            working_dir = working_dir.join("test");
        }

        let workspace_dir = working_dir.join("workspace");
        let public_dir = working_dir.join("public");
        let combine_dir = working_dir.join("combine");
        let version_file_official = working_dir.join("public/versions.txt");
        let version_file_internal = working_dir.join("public/versions.internal.txt");
        let ignores_file = working_dir.join("ignores.txt");

        AppContext {
            working_dir, 
            workspace_dir, 
            public_dir, 
            combine_dir, 
            index_file_official: version_file_official, 
            index_file_internal: version_file_internal, 
            ignores_file,
        }
    }
}

fn main() {
    std::env::set_var("RUST_BACKTRACE", "1");
    
    let context = AppContext::new();

    std::fs::create_dir_all(&context.workspace_dir).unwrap();

    let eixtcode = match CommandLineInterface::parse().command {
        Commands::Pack { version_label } => do_pack(version_label, context),
        Commands::Check => do_check(context),
        Commands::Combine { new_label } => do_combine(context, &new_label),
        Commands::Test => do_test(context),
    };

    std::process::exit(eixtcode)
}
