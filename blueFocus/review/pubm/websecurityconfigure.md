package com.laigeoffer.pmhub.monitor.config;
```
- 声明包名，表明该类属于 `com.laigeoffer.pmhub.monitor.config` 包。

```java
import de.codecentric.boot.admin.server.config.AdminServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
```
- 导入依赖的类。  
  - `AdminServerProperties`：Spring Boot Admin 的配置属性。
  - `@Bean`：用于定义 Spring Bean。
  - `HttpSecurity`：Spring Security 的安全配置核心类。
  - `@EnableWebSecurity`：开启 Spring Security。
  - `SecurityFilterChain`：Spring Security 5.4+ 推荐的安全配置方式。
  - `SavedRequestAwareAuthenticationSuccessHandler`：认证成功处理器。

```java
/**
 * 监控权限配置
 * 
 * @author canghe
 */
@EnableWebSecurity
public class WebSecurityConfigurer
{
```
- 注释说明该类用于监控权限配置。
- `@EnableWebSecurity` 注解开启 Spring Security。
- 定义 `WebSecurityConfigurer` 配置类。

```java
    private final String adminContextPath;
```
- 定义一个只读成员变量，保存 Admin Server 的上下文路径。

```java
    public WebSecurityConfigurer(AdminServerProperties adminServerProperties)
    {
        this.adminContextPath = adminServerProperties.getContextPath();
    }
```
- 构造方法，注入 `AdminServerProperties`，并获取上下文路径（如 `/admin`）。

```java
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception
    {
```
- 定义一个 `SecurityFilterChain` Bean，Spring Security 5.4+ 推荐的配置方式。

```java
        SavedRequestAwareAuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setTargetUrlParameter("redirectTo");
        successHandler.setDefaultTargetUrl(adminContextPath + "/");
```
- 创建认证成功处理器。
- `setTargetUrlParameter("redirectTo")`：登录成功后跳转到请求参数 `redirectTo` 指定的页面。
- `setDefaultTargetUrl(adminContextPath + "/")`：如果没有指定跳转页面，则跳转到 Admin Server 首页。

```java
        return httpSecurity
                .headers().frameOptions().disable()
```
- 禁用 `frameOptions`，允许页面被嵌入到 `<iframe>`，否则页面会被浏览器拦截。

```java
                .and().authorizeRequests()
                .antMatchers(adminContextPath + "/assets/**"
                        , adminContextPath + "/login"
                        , adminContextPath + "/actuator/**"
                        , adminContextPath + "/instances/**"
                ).permitAll()
```
- 配置 URL 权限。
- `antMatchers(...).permitAll()`：允许未登录访问静态资源、登录页、actuator 端点、instances 端点。

```java
                .anyRequest().authenticated()
```
- 其他所有请求都需要认证（登录）。

```java
                .and()
                .formLogin().loginPage(adminContextPath + "/login")
                .successHandler(successHandler).and()
```
- 配置表单登录。
- 登录页面为 `/admin/login`。
- 登录成功后使用上面定义的 `successHandler`。

```java
                .logout().logoutUrl(adminContextPath + "/logout")
                .and()
```
- 配置注销 URL。

```java
                .httpBasic().and()
```
- 启用 HTTP Basic 认证（支持 curl、postman 直接访问）。

```java
                .csrf()
                .disable()
```
- 禁用 CSRF 防护（适合 API 或前后端分离场景）。

```java
                .build();
    }
}
```
- 构建并返回 `SecurityFilterChain`。

---

## 总结

- 该配置类为 Spring Boot Admin Server 提供安全保护。
- 允许未登录访问静态资源、登录页、健康检查等接口。
- 其他接口必须登录后才能访问。
- 支持表单登录和 HTTP Basic 认证。
- 登录成功后自动跳转到原请求或首页。
- 禁用 CSRF 和 frameOptions，适合管理后台和监控场景。

如需进一步讲解某一行或某一块代码，请补充说明！// filepath: /Users/gongfan/pmhub/pmhub-monitor/src/main/java/com/laigeoffer/pmhub/monitor/config/WebSecurityConfigurer.java
package com.laigeoffer.pmhub.monitor.config;
```
- 声明包名，表明该类属于 `com.laigeoffer.pmhub.monitor.config` 包。

```java
import de.codecentric.boot.admin.server.config.AdminServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
```
- 导入依赖的类。  
  - `AdminServerProperties`：Spring Boot Admin 的配置属性。
  - `@Bean`：用于定义 Spring Bean。
  - `HttpSecurity`：Spring Security 的安全配置核心类。
  - `@EnableWebSecurity`：开启 Spring Security。
  - `SecurityFilterChain`：Spring Security 5.4+ 推荐的安全配置方式。
  - `SavedRequestAwareAuthenticationSuccessHandler`：认证成功处理器。

```java
/**
 * 监控权限配置
 * 
 * @author canghe
 */
@EnableWebSecurity
public class WebSecurityConfigurer
{
```
- 注释说明该类用于监控权限配置。
- `@EnableWebSecurity` 注解开启 Spring Security。
- 定义 `WebSecurityConfigurer` 配置类。

```java
    private final String adminContextPath;
```
- 定义一个只读成员变量，保存 Admin Server 的上下文路径。

```java
    public WebSecurityConfigurer(AdminServerProperties adminServerProperties)
    {
        this.adminContextPath = adminServerProperties.getContextPath();
    }
```
- 构造方法，注入 `AdminServerProperties`，并获取上下文路径（如 `/admin`）。

```java
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception
    {
```
- 定义一个 `SecurityFilterChain` Bean，Spring Security 5.4+ 推荐的配置方式。

```java
        SavedRequestAwareAuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setTargetUrlParameter("redirectTo");
        successHandler.setDefaultTargetUrl(adminContextPath + "/");
```
- 创建认证成功处理器。
- `setTargetUrlParameter("redirectTo")`：登录成功后跳转到请求参数 `redirectTo` 指定的页面。
- `setDefaultTargetUrl(adminContextPath + "/")`：如果没有指定跳转页面，则跳转到 Admin Server 首页。

```java
        return httpSecurity
                .headers().frameOptions().disable()
```
- 禁用 `frameOptions`，允许页面被嵌入到 `<iframe>`，否则页面会被浏览器拦截。

```java
                .and().authorizeRequests()
                .antMatchers(adminContextPath + "/assets/**"
                        , adminContextPath + "/login"
                        , adminContextPath + "/actuator/**"
                        , adminContextPath + "/instances/**"
                ).permitAll()
```
- 配置 URL 权限。
- `antMatchers(...).permitAll()`：允许未登录访问静态资源、登录页、actuator 端点、instances 端点。

```java
                .anyRequest().authenticated()
```
- 其他所有请求都需要认证（登录）。

```java
                .and()
                .formLogin().loginPage(adminContextPath + "/login")
                .successHandler(successHandler).and()
```
- 配置表单登录。
- 登录页面为 `/admin/login`。
- 登录成功后使用上面定义的 `successHandler`。

```java
                .logout().logoutUrl(adminContextPath + "/logout")
                .and()
```
- 配置注销 URL。

```java
                .httpBasic().and()
```
- 启用 HTTP Basic 认证（支持 curl、postman 直接访问）。

```java
                .csrf()
                .disable()
```
- 禁用 CSRF 防护（适合 API 或前后端分离场景）。

```java
                .build();
    }
}
```
- 构建并返回 `SecurityFilterChain`。

---

## 总结

- 该配置类为 Spring Boot Admin Server 提供安全保护。
- 允许未登录访问静态资源、登录页、健康检查等接口。
- 其他接口必须登录后才能访问。
- 支持表单登录和 HTTP Basic 认证。
- 登录成功后自动跳转到原请求或首页。
- 禁用 CSRF 和 frameOptions，适合管理后台和监控场景。

如需进一步讲解某一行或某一块代码，请补充说明！
