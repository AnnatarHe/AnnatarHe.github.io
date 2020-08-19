---
layout: post
title: golang 项目的单元测试
tags: code golang ci
---

本文是个实操文章，没有任何理论内容。

## 普通测试

golang 的工具链做得很好，测试只需要给文件后缀加上 `_test.go` 即可，例如代码是这样的

```go
func sum(a, b int) int {
    return a + b
}
```

那么测试文件名只要是 `sum_test.go` 即可，内容写起来和其他语言的测试不太一样，不需要引入各种莫名其妙的测试框架和 assert 包，只要一个自带的 `testing` 即可，当然它有一个规定是必须以 `Test` 开头的函数才会被认为是测试用例

```go
func TestSum(t *testing.T) {
    result := sum(1, 2)
    if result != 3 {
        t.Errorf("ooops")
    }
}
```

到这里一个测试就写完了，可以通过命令 `go test ./...` 来执行，它的意思是执行当前包下的所有测试用例。通过了就是 ok 没通过会报错

## 强化版单元测试

上面的原生测试看得出非常非常的简单，特别符合 golang 的设计理念。但是写起来不免有些太累了。单元测试的粒度都是很细的，很多时候一个 case 的执行需要太多的上下文满足条件，那么这样简单的一个 func 一把梭的形势是不太符合略微复杂一些的场景需求。另一方面 `t.Errorf` 的接口实在过于原始，没错它能用，但是一定程度上依赖 `if` 去输出错误。大多数语言都有 `assert` 这样的标准库来实现断言。

幸运的是有这样想法的人不在少数，更幸运的是社区有人已经实现了这些想法 [testify](https://github.com/stretchr/testify) 是其中做的比较好的一个库。

比如我们描述这样的一个场景：

```go
var db *sql.DB

func insert(a *obj) error {
    return db.Exec("insert xxxx", &a).Error
}

func delete() error {
    return db.Exec("truncate table").Error
}
```

那么对这个逻辑做测试的时候首先要启动 db 链接，可能额外的还有 rpc, redis 连接之类的。那么测试结束要主动关闭这些连接。那么测试就有了生命周期的概念。使用 `suite` 就会比较容易地解决这个问题：

```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"
)

type ExampleTestSuite struct {
    suite.Suite
    msg string
}

func (suite *ExampleTestSuite) SetupTest() {
    suite.msg = "iu is my wife"
    db, _ = sql.Open("xxx")
}

// 以 Test 开头
func (suite *ExampleTestSuite) TestExample() {
    m := &obj{
        Msg: suite.msg
    }
    err := insert(m)
    assert.Nil(suite.T(), err)
    assert.Equal(suite.T(), suite.msg, m.Msg)
}

func (suite *ExampleTestSuite) TearDownTest() {
    db.Close()
}

// 以 Test 开头
func TestExampleTestSuite(t *testing.T) {
    suite.Run(t, new(ExampleTestSuite))
}
```

这段代码在被 `go test` 执行的时候会首先被索引到 `TestExampleTestSuite` 然后执行到其中的 `suite.Run` 进而触发其中预先编写好的测试用例。顺序也会按照 `SetupTest` -> `Test*` -> `TearDownTest` 的顺序执行。这样就有了一个生命周期的概念。可以做一些公共的初始化及清理操作。

细心的你可能也留意到了其中的 `assert` 断言库，相比较原生的 `t.Errorf` 而言终于比较像其他断言了。会很容易地做各种 assert. 具体可以查看文档： [https://pkg.go.dev/github.com/stretchr/testify/assert?tab=doc](https://pkg.go.dev/github.com/stretchr/testify/assert?tab=doc)

只是写起来其实还是感觉比前端社区少点儿新意。 jest 现在流行做 snapshot 的测试了，可以更加节省写 test case 时候的重复 assert。 golang 社区努力啊，学学隔壁的 jest 抄一抄。

## 如何测试 http 请求

据我个人观察大部分人还是将 golang 作为 web server 来使用的。那么对 http 接口的测试一定是个非常重的话题。

一个 http 接口可以做的事情非常多，一个比较典型的场景可以概括为这样：

```go
func helloHandler(c *gin.Context) {
    var q map[string]interface{}
    c.Bind(&q)
    resp, err := service.InsertData(q)
    service.UpdateData(resp.xxxx)
    service.DeleteData(resp.bbbb)
    rpc.CallFunc(resp.ddd)
    go cache.UpdateData(resp)
    c.JSON(http.StatusOK, q)
    return
}

func auth(c *gin.Context) {
    token := c.Header("Authorization")
    resp := rpc.checkUser(token)
    c.Set("user", resp)
}

func main() {
    h := gin.Default()
    h.GET("/api/v1/hello", auth, helloHandler)
}
```

那么其中涉及到了数据库操作，缓存服务，外部依赖的 rpc 服务。我们暂时先简化去掉 rpc 的调用来看看一个普通的请求应该如何测试。

继续通过 testify 的 suite 形势组织测试用例：

```go

type AppsTestSuite struct {
	suite.Suite
	user   *service.User
	router *gin.Engine
}

func (suite *AppsTestSuite) SetupSuite() {
    dbOpen()
    cacheOpen()
	user := &service.User{
		Email: "iu.is.my.wife@annatarhe.com",
	}
	suite.router = routes.SetupGinRoutes()
	suite.user = user
}

func (suite *AppsTestSuite) TestUpdateAppNote() {
	getRequest := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/api/v1/hello", nil)
	req.Header.Set("Authorization", "Bearer SOME_MOCKED_TOKEN_HERE")
	req.Header.Set("Content-Type", "application/json")
	suite.router.ServeHTTP(getRequest, req)
	assert.Equal(suite.T(), 400, getRequest.Code)
}

func (s *AppsTestSuite) TearDownSuite() {
    dbClose()
    cacheClose()
}

func TestAppsTestSuite(t *testing.T) {
	suite.Run(t, new(AppsTestSuite))
}
```

这里以 gin 为例子，它在官方文档中表明了这种组织方式，所以可以初始化 db, cache 和 router 之后构造一个 http 请求走后续的流程来进行模拟。当然其中涉及到的 db migration 需要在测试用例跑起来之前的启动环境中都准备好。

## 如何测试 GraphQL 接口

那么 http 接口测试已经实现了，如何测试 GraphQL 接口呢？其实我暂时还没有找到一个非常好的方案，但是想了一下应该还算比较接近。

有两种方案：

* 依旧是 http 测试的方式，通过发不同的 query 去 expect 结果。但是情况实在是太多太多太多了，想要完整覆盖只能变成体力活。
* 只测试 resolver。

后来我在方案实施的时候使用了第二种方案。graphql 库是用的 [graph-gophers/graphql-go](https://github.com/graph-gophers/graphql-go) 它有一个比较好的功能是会在启动的时候检查 schema 是否正确，其实就避免了只测试 resolver 而不检查 schema 的问题。毕竟如果 schema 不正确服务就不能正常启动，那么 http 服务也无法起来， liveness probe 是不会过的

那么举例一个 graphql resolver：

```go
type Wife struct {
    msg string
}

type queryArgs struct {
    FooID graphql.ID
}

type query struct {}

func (_ *query) FindMyWife(ctx context.Context, args queryArgs) (Wife, error) {
	return App{
        msg: "iu is my wife",
    }, nil
}
func (w Wife) Message() string {
	return a.msg
}
```

```go
func TestFindMyWife(t *testing.T) {
    q := &query{}
    result, err := q.FindMyWife(
        context.TODO(),
        queryArgs{
            FooID: graphql.ID("xxxx")
        },
    )

    if err != nil {
        t.Errorf(err)
    }

    // 我全都要
    if result.Message() != "gakki" {
        t.Errorf(err)
    }
}
```

简而言之就是当作测普通的函数来测 graphql 接口

## mock 接口

上文中提到了 rpc 接口，rpc 接口是个比较典型的场景，它属于外部服务，又不能真的调用，返回严重依赖于业务逻辑，无法固定。在进行单元测试的这种情况下只能 mock 掉返回假值。

但是比较麻烦的是 golang 这门语言没办法方便地复写对象。只能通过依赖注入的形式注入 mockedObject 到服务中。其实在原设计中就不能很粗糙地直接调用 rpc 了，需要上层通过 interface 封装一层：

```go
type FindMyWifeService interface {
    FindByName(name string) (string, error)
}

type findMyWifeService struct {
    rpcClient *pb.WifeServiceClient
}

func NewFindMyWifeService(client *pb.WifeServiceClient) FindMyWifeService {
    return findMyWifeService{
        rpcClient: client,
    }
}

func (f findMyWifeService) FindByName(name string) (string, err) {
    resp, err := f.rpcClient.CallSomeFunc(context.TODO(), pb.In{Name: name})
    return resp.Result, err
}
```

改成这样的写法之后 rpcClient 就可以通过外层注入来实现 mock 了。那么 mock 还是使用 testify 准备好的 mock: [https://pkg.go.dev/github.com/stretchr/testify/mock?tab=doc](https://pkg.go.dev/github.com/stretchr/testify/mock?tab=doc) 非常好用。还需要配合 [mockery](https://github.com/vektra/mockery) 来实现接口的自动生成 mock 文件。这两个工具后续可以看，这里简单演示一下如何使用：

```bash
mockery --name=WifeServiceClient --recursive=true
```

它会生成一份 mocked 的文件在 `mocks` 文件夹下, 这时就可以在测试中结合这份 mock 过的 interface 做一些操作了。

```go
var service findMyWifeService

func SetupTest() {
    c := &mocks.WifeServiceClient{}
    service = NewFindMyWifeService(c)

    c.On(
		"CallSomeFunc",
		context.TODO(),
		&pb.InRequest{ Name: "gakki" },
	).Return(&pb.CResponse{
        Message: "wo quan dou yao",
	}, nil)
}
```

这个时候只要调用 rpc 方法中的 `CallSomeFunc` 方法就会走到这个 mock 了返回值的方法。

## 其他

golang 自带有 coverage 报告的，可以使用这样的命令：

```bash
$ go test ./... -coverprofile .testCoverage.txt
$ go tool cover -func .testCoverage.txt
```

如果需要配合 gitlab 可以在 **settings/CICD/General pipeline/Test coverage parsing** 中填入 `^total:\t+\(statements\)\t+(\d+\.\d+)%` 这样 gitlab 就会索引到对应的测试覆盖率了。