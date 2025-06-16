但我发现，很少人在用知识库，大家的一个痛点就是把内容加进「知识库」这件事比较费劲。虽然腾讯的IMA知识库能让大家把公众号文章等内容快速存到知识库里，但受限于知识库的能力、模型和工作流问题，这种形式只能日常问答一下，无法赋能业务。


今天就跟大家分享一下，Dify如何用爬虫抓取网络内容后写入知识库中。

我的业务是数学思维的教培，经常需要制作优秀的小红书笔记、公众号内容来吸引客户。但纯AI生成的内容幻觉严重，而且「不落地」

所以我打算新建一个「数学思维知识库」，把小红书、公众号上优秀的内容都存进去，然后再让AI基于知识库来做内容的生产，效率和效果都能有保证。

# 前期准备

## 1. 创建知识库

如图，创建一个用于装内容的知识库。这里，我们创建一个空的即可。
![image](https://github.com/user-attachments/assets/744f6ed8-84b3-49fb-b7e4-f407faae8b26)


https://cloud.dify.ai/datasets/2a878f27-726a-4843-849c-00e02412f0ad/documents


![image](https://github.com/user-attachments/assets/f6b21a1a-84df-4702-82cb-0480c241b7d3)


# 2. 新建API密钥
目前，Dify暂没有可以直接写入数据库的插件，所以我们是通过HTTP请求来解决的。而走http就需要密钥。按下图新建一个。

注意⚠️ 这个密钥是可以操作所有知识库的


接着在文档中，找到通过文本创建文档，这里的请求规则就是后面我们需要编写的。



![image](https://github.com/user-attachments/assets/e7e6c4bd-2d02-4b91-b558-d479aefd71f5)

# 3. 安装Firecrawl

因为我们是要爬网页上的内容，所以需要一个爬虫工具。这里选择用Firecrawl，可以直接在插件市场里找到安装。



![image](https://github.com/user-attachments/assets/6b127998-2eb8-4a04-8cd6-17abacd193b5)

然后根据提示到官网注册一个账号，拿到API Key


![image](https://github.com/user-attachments/assets/3608da16-1a86-4776-b463-8e421f4ac1d1)


⚠️注意：Firecrawl实际只是有一定的免费额度


以上准备工作完成，我们就可以开发工作流了。老规矩，一步一步来，先做一个简单的，再做一个复杂的。

青铜：抓取单页面存入知识库

以下就是完整的工作流：逻辑是从用户的输入内容中提取出网址，接着用Firecrawl去读取页面内容，再用AI提炼出标题和正文，最后存入知识库。

![image](https://github.com/user-attachments/assets/97b75f2b-9e8f-44c0-bff0-15346198f518)


# 1. 参数提取器

如图，很简单就不多说了。

![image](https://github.com/user-attachments/assets/e99cda72-4b0c-402d-8cc3-3e2aba48b38b)



![image](https://github.com/user-attachments/assets/3ab27ad5-3601-4734-a346-1d9b62ec6da9)


# 2. 单页面抓取

Firecrawl是有多个工具可以选


![image](https://github.com/user-attachments/assets/d0fbc310-e8e8-41b3-bd64-498e69d8bdca)

但这里我们选单页面抓取就好了设置返回的结果是markdown格式

仅抓取主要内容为True，就是把无关的页头页尾之类的删掉


![image](https://github.com/user-attachments/assets/f1d8ab8a-30cd-4d8a-a60b-38505854ce33)

其中，关键的地方在于「请求头」

要知道，所有网站都有反爬措施，尤其是公众号文章，正常去抓是会识别成机器人，返回错误结果的，如下图：




![image](https://github.com/user-attachments/assets/3f703972-18d8-4f7d-9b5b-58d7b0189ca8)



解决方案就是加个请求头，伪装成正常的浏览器：

```js
{'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
```

这样就能正确把文章内容抓下来了。



![image](https://github.com/user-attachments/assets/4b287796-13c7-4a63-9aef-cf388b317fd6)





# 3. 参数提取器

目的是从返回的内容中把标题和正文识别出来。注意在提示词中要让AI确保还原完整的内容，不要去做任何改动。



![image](https://github.com/user-attachments/assets/75538ec8-323c-4ae8-8069-f904f68ab9bd)

# 4. 转义特殊符号

因为我们要走HTTP请求，对于内容的格式是特别敏感的，有点换行符之类的就会报错了。

这里我们直接插入一段代码，把里面的几乎所有特殊符号都做处理。


![image](https://github.com/user-attachments/assets/7f055c7b-f4d4-4b4f-9ff0-9c50087e1133)

```js
function main({arg1}) {
    return {
        content: arg1.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    }
}
```


# 5. HTTP请求：存进知识库

有了内容后，就可以新建HTTP请求节点。这里有个小技巧，就是把前面API文档里的cURL示例，复制过来，能自动填入

![image](https://github.com/user-attachments/assets/d8fd9ae1-0f17-4fbc-8886-05e9dbc68393)


然后点上面的「鉴权API-Key」按下图把知识库的密钥加进去。


![image](https://github.com/user-attachments/assets/ac0f74a5-2876-4cec-b3a6-678789a20aa6)


还有个要点：Headers里一定要加Content-Type，要不然会无法识别正确的格式。

# 6. 测试运行
至此，就完成工作流了。测试一下：把网址放进去。


![image](https://github.com/user-attachments/assets/51a9f85f-be99-44dd-95a4-e0b8d6a615e1)

先不着急用这个知识库，今天这内容，解决的是「存入」的问题，下次来解决「读取」怎么用的问题。

# 白银：批量存多篇内容

假如我现在有一批内容，要存进去，怎么搞？这样一篇一篇的加，明显效率很低。

思路是：

1. 先获取这些内容的地址

2. 用「迭代」节点遍历网址，循环调用第一步的“读取网页-存入知识库”工作流长这样：


![image](https://github.com/user-attachments/assets/8aa003a9-7f8c-4073-8271-b784514674fb)



接下来就是对工作流做修改

1. 参数提取器


首先是「参数提取器」，把提取参数改成 数组类型Array


同时修改「指令」要求AI输出的是数组



![image](https://github.com/user-attachments/assets/8711344f-1a95-4ed9-9511-eb89ed9f85e9)

2. 新建「迭代」节点



![image](https://github.com/user-attachments/assets/b739fb40-9943-4402-a1bb-a962c6ce30bd)

把原先的流程，一模一样的在迭代里重新新建（吐槽：怎么不能直接复制进去呢？麻烦）


![image](https://github.com/user-attachments/assets/ec125d08-f455-4d14-ade3-a6c3069f0648)

要点：注意迭代输入的一定是Array的数组类型，这样才能逐个遍历去跑。


![image](https://github.com/user-attachments/assets/1f27d997-aa8f-4f87-9839-ac8285005124)

# 3. 运行测试

我们一次性把多篇地址扔进去，就可以看到「迭代」里面已经在跑了：


![image](https://github.com/user-attachments/assets/45c1a73a-b583-415a-95e6-ea09cbf59dc7)

# 黄金：自动爬虫

除了手动去加之外，还有没有更极致的方法呢？我想是有的，两个思路：

1个是借助AI「深度搜索」的能力，把相关内容，先搜索一遍，再整理到知识库中，这样就能快速新建多个主题的知识库内容

另一个是借助Agent 的能力，给一个网站AI之后，让它判断这个网站有什么跟主题相关的内容，然后把内容抓下来存进数据库。

后者就有点像是Browser-use的能力，可以自主浏览网站，这样是不是连小红书也能爬进去知识库了？



