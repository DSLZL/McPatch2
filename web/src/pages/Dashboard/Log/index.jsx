import React, {useEffect, useRef, useState} from "react";
import {Button, Input, message, Modal, Popconfirm, Popover, Select} from "antd";
import {
  taskCombineRequest, taskPackRequest,
  taskRevertRequest,
  taskTestRequest,
  taskUploadRequest,
  taskStatusRequest
} from "@/api/task.js";
import {terminalFullRequest, terminalMoreRequest} from "@/api/terminal.js";
import {RotateCcw} from "lucide-react";
import {generateRandomStr, showFileSize, showTime} from "@/utils/tool.js";
import {miscVersionListRequest} from "@/api/misc.js";

const {TextArea} = Input;

const VersionList = ({versionList}) => {

  const content = (
    <div>
      {
        versionList.map((version, index) => {
          return (
            <div key={index} className={"p-2"}>
              <div className={"flex justify-start"}>
                <div className={"mr-3 w-40 max-h-4"}><span className={"font-bold"}>版本号: </span>{version.label}</div>
                <div className={"mr-3 w-40 max-h-4"}>
                  <span className={"font-bold"}>大小: </span>{showFileSize(version.size)}
                </div>
                <div className={"mr-3 w-96 max-h-12 overflow-auto"}>
                  <span className={"font-bold"}>更新记录: </span>{version.change_logs}
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )

  return (
    <>
      {
        versionList.length > 0 ? (
          <Popover placement="bottom" content={content}>
            <Button size={"large"}>{versionList[0].label}</Button>
          </Popover>
        ) : (
          <></>
        )
      }
    </>
  )
}

const Index = () => {

  const options = [
    {value: 3000, label: '3s'},
    {value: 1000, label: '1s'},
    {value: 5000, label: '5s'},
    {value: 10000, label: '10s'},
  ]

  const [logs, setLogs] = useState([])
  const [packShow, setPackShow] = useState(false)
  const [version, setVersion] = useState('');
  const [updateRecord, setUpdateRecord] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(parseInt(localStorage.getItem('logRefreshInterval')) || options[0].value);
  const [versionList, setVersionList] = useState([])
  const logsRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    terminalFull()
  }, []);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      terminalMore()
    }, refreshInterval)

    return () => clearInterval(intervalId);
  }, [refreshInterval])

  useEffect(() => {
    miscVersionList()
  }, []);

  const terminalFull = async () => {
    const {code, msg, data} = await terminalFullRequest();
    if (code === 1) {
      setLogs(data.content)
    }
  }

  const terminalMore = async () => {
    const {code, msg, data} = await terminalMoreRequest();
    if (code === 1) {
      if (data.content.length !== 0) {
        setLogs(prev => prev.concat(data.content))
      }
    }
  }

  const changeRefreshInterval = (value) => {
    setRefreshInterval(value)
    localStorage.setItem('logRefreshInterval', value)
  };

  const miscVersionList = async () => {
    const {code, msg, data} = await miscVersionListRequest();
    if (code === 1) {
      setVersionList(data.versions);
    }
  }

  const taskPack = async () => {
    const tempVersion = version === '' ? generateRandomStr() : version
    const tempUpdateRecord = updateRecord === '' ? '这个人很懒, 没有写更新记录.' : updateRecord

    const {code, msg, data} = await taskPackRequest(tempVersion, tempUpdateRecord);
    if (code === 1) {
      await miscVersionList()
      messageApi.success('打包成功.')
    } else {
      messageApi.error(msg)
    }
    setPackShow(false)
  }

  const taskCombine = async () => {
    const {code, msg, data} = await taskCombineRequest();
    if (code === 1) {
      messageApi.success('合并成功.')
    } else {
      messageApi.error(msg)
    }
  }

  const taskTest = async () => {
    const {code, msg, data} = await taskTestRequest();
    if (code === 1) {
      messageApi.success('测试成功.')
    } else {
      messageApi.error(msg)
    }
  }

  const taskRevert = async () => {
    const {code, msg, data} = await taskRevertRequest();
    if (code === 1) {
      messageApi.success('回退成功.')
    } else {
      messageApi.error(msg)
    }
  }

  const taskUpload = async () => {
    const {code, msg, data} = await taskUploadRequest();
    if (code === 1) {
      messageApi.success('任务已提交.')
    } else {
      messageApi.error(msg)
    }
  }

  const taskStatus = async () => {
    const {code, msg, data} = await taskStatusRequest();
    if (code === 1) {
      messageApi.success('任务已提交.')
    } else {
      messageApi.error(msg)
    }
  }

  const copy = async (item) => {
    await navigator.clipboard.writeText(`${showTime(item.time)}-${item.level}-${item.content}`);
    messageApi.success('复制成功!')
  }

  const getTextColor = (level) => {
    if (level === 'debug') return 'text-zinc-500';
    if (level === 'info') return 'text-white';
    if (level === 'warning') return 'text-yellow-600';
    if (level === 'error') return 'text-[#FF0000]';
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-col p-10 min-h-screen">
        <div className="flex justify-start items-center h-8">
          <VersionList versionList={versionList}/>
          <Popconfirm title="风险操作,请再次确认!" onConfirm={taskStatus} okText="确定" cancelText="取消">
            <Button type="primary" size="large" className="ml-2">检查文件修改</Button>
          </Popconfirm>
          <Popconfirm title="风险操作,请再次确认!" onConfirm={taskTest} okText="确定" cancelText="取消">
            <Button type="primary" size="large" className="ml-2">测试更新包</Button>
          </Popconfirm>
          <Popconfirm title="风险操作,请再次确认!" onConfirm={taskUpload} okText="确定" cancelText="取消">
            <Button type="primary" size="large" className="ml-2">上传public目录</Button>
          </Popconfirm>
          <Button type="primary" size="large" className="ml-2" onClick={() => setPackShow(true)}>打包新版本</Button>
          <Popconfirm title="风险操作,请再次确认!" onConfirm={taskRevert} okText="确定" cancelText="取消">
            <Button type="primary" size="large" className="ml-2">回退整个工作空间</Button>
          </Popconfirm>
          <Popconfirm title="风险操作,请再次确认!" onConfirm={taskCombine} okText="确定" cancelText="取消">
            <Button type="primary" size="large" className="ml-2">合并更新包</Button>
          </Popconfirm>
          <Select
            defaultValue={refreshInterval}
            size={"large"}
            className="ml-auto w-40"
            onChange={changeRefreshInterval}
            options={options}/>
          <Button type="primary" size="large" className="ml-2" icon={<RotateCcw size={20} strokeWidth={1.5}/>}
                  onClick={terminalMore}/>

        </div>
        <div
          ref={logsRef}
          className="flex-1 mt-8 bg-black dark:bg-gray-800 text-white overflow-auto min-h-[calc(100vh-160px)] max-h-[calc(100vh-160px)]">
          {
            logs.map((item, index) => {
              return (
                <div
                  key={index}
                  onClick={() => copy(item)}
                  className="flex items-center pt-0.5 pb-0.5 pl-2 text-base text-gray-300 rounded cursor-pointer select-none hover:bg-gray-700 duration-200">
                  <span className="w-48">[{showTime(item.time)}]</span>
                  {/*<span className={`w-24 ${getTextColor(item.level)}`}>[{item.level}]</span>*/}
                  <span className={`${getTextColor(item.level)}`}>{item.content}</span>
                </div>
              )
            })
          }
        </div>
      </div>
      <Modal
        title="打包"
        okText="确认"
        cancelText="取消"
        open={packShow}
        onOk={taskPack}
        onCancel={() => setPackShow(false)}>
        <div>
          <div className="text-base text-gray-400">版本号与详情均可不填,使用默认参数.</div>
          <Input
            className="mt-5"
            placeholder="请输入版本号."
            value={version}
            onChange={(e) => setVersion(e.target.value)}/>
          <TextArea
            className="mt-2 mb-5"
            placeholder="请输入更新记录."
            autoSize={{maxRows: 10, minRows: 4}}
            maxLength={4000}
            value={updateRecord}
            onChange={(e) => setUpdateRecord(e.target.value)}/>
        </div>
      </Modal>
    </>
  );
};

export default Index;
