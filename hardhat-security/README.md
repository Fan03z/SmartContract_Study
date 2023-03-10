# 利用 slither 进行安全审计

1. 需要先安装 python(3),(`python3 --version`和`pip3 --version`检查版本)

2. 安装 solc-select 以控制审计的 solidity 版本 (`pip3 install solc-select`)

3. 选择 solidity 审计版本,比如 0.8.7 (`solc-select use 0.8.7`) (可选项)

4. 安装 slither-analyzer 进行安全审计 (`pip3 install slither-analyzer`) 检查是否安装 (`slither --help`)

5. 进行安全审计,得到结果 (`slither . --solc-remaps '@openzeppelin=node_modules/@openzeppelin @chainlink=node_modules/@chainlink' --exclude naming-convention,external-function,low-level-calls`)

可以在 package.json 中添加快捷指令: `"slither": "slither . --solc-remaps '@openzeppelin=node_modules/@openzeppelin @chainlink=node_modules/@chainlink' --exclude naming-convention,external-function,low-level-calls",`

6. 问题: slither 会抓住大部分的漏洞,而且是比较大型的安全漏洞,但会有一些未发现漏洞的风险

# 通过 Docker 进行手动审计

在 package.json 中添加快捷指令: `"toolbox": "docker run -it --rm -v $PWD:/src trailofbits/eth-security-toolbox",`

1. 打开 Docker 服务,运行 docker damon

2. 运行快捷指令 `yarn toolbox`

3. 得到展示的审计工具,选择工具进行细分审计,例如利用 echidna-test 工具对 VaultFuzzTest.sol 进行审计:
   `echidna-test /src/contracts/test/fuzzing/VaultFuzzTest.sol --contract VaultFuzzTest --config /src/contracts/test/fuzzing/config.yaml`

4. 退出审计进程 `exit`
