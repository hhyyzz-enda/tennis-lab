<template>
  <section class="auth-section">
    <div class="panel dark auth-intro">
      <p class="panel-tag">{{ $t('page.auth.kicker') }}</p>
      <h3>{{ $t('page.auth.title') }}</h3>
      <p>{{ authPageMode === 'login' ? $t('page.auth.loginLead') : $t('page.auth.registerLead') }}</p>
    </div>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="mode-switch">
        <button type="button" :class="{ active: authPageMode === 'login' }" @click="switchAuthPage('login')">
          {{ $t('page.auth.loginTab') }}
        </button>
        <button type="button" :class="{ active: authPageMode === 'register' }" @click="switchAuthPage('register')">
          {{ $t('page.auth.registerTab') }}
        </button>
      </div>

      <template v-if="authPageMode === 'login'">
        <div class="mode-switch login-mode-switch">
          <button type="button" :class="{ active: loginMode === 'password' }" @click="switchLoginMode('password')">
            {{ $t('page.auth.loginByUsername') }}
          </button>
          <button type="button" :class="{ active: loginMode === 'code' }" @click="switchLoginMode('code')">
            {{ $t('page.auth.loginByCode') }}
          </button>
        </div>

        <template v-if="loginMode === 'password'">
          <label>
            {{ $t('page.auth.username') }}
            <el-input
              class="auth-input"
              v-model.trim="loginForm.username"
              :placeholder="$t('page.auth.usernamePlaceholder')"
              autocomplete="new-password"
              name="login-username-no-autofill"
            />
          </label>
          <label>
            {{ $t('page.auth.password') }}
            <el-input
              class="auth-input"
              v-model="loginForm.password"
              type="password"
              show-password
              :placeholder="$t('page.auth.passwordPlaceholder')"
              autocomplete="new-password"
              name="login-password-no-autofill"
            />
          </label>
        </template>

        <template v-else>
          <label>
            {{ $t('page.auth.email') }}
            <el-input
              class="auth-input"
              v-model.trim="codeLoginForm.email"
              :placeholder="$t('page.auth.emailPlaceholder')"
              autocomplete="off"
            />
          </label>
          <label>
            {{ $t('page.auth.codeLogin') }}
            <div class="code-field-row">
              <el-input
                class="auth-input"
                v-model.trim="codeLoginForm.code"
                :placeholder="$t('page.auth.codePlaceholder')"
                autocomplete="off"
              />
              <el-button
                class="send-code-btn"
                type="default"
                round
                :loading="isLoginCodeSending"
                :disabled="isLoginCodeSending || loginCodeCountdown > 0"
                @click="handleSendEmailCode"
              >
                {{ loginCodeCountdown > 0 ? `${loginCodeCountdown}s` : $t('page.auth.sendCode') }}
              </el-button>
            </div>
          </label>
        </template>

        <div class="auth-actions">
          <el-button type="primary" round :loading="isLoginSubmitting" native-type="submit">
            {{ loginMode === 'password' ? $t('page.auth.loginWithPassword') : $t('page.auth.loginWithCode') }}
          </el-button>
        </div>
      </template>

      <template v-else>
        <label>
          {{ $t('page.auth.username') }}
          <el-input
            class="auth-input"
            v-model.trim="registerForm.username"
            :placeholder="$t('page.auth.usernamePlaceholder')"
            autocomplete="off"
            @input="sanitizeNoWhitespace('username')"
          />
        </label>
        <label>
          {{ $t('page.auth.password') }}
          <el-input
            class="auth-input"
            v-model="registerForm.password"
            type="password"
            show-password
            :placeholder="$t('page.auth.passwordPlaceholder')"
            autocomplete="new-password"
            name="register-password-new"
            @input="sanitizeRegisterPassword"
          />
        </label>
        <label>
          {{ $t('page.auth.email') }}
          <el-input
            class="auth-input"
            v-model.trim="registerForm.email"
            type="email"
            :placeholder="$t('page.auth.emailPlaceholder')"
            @input="sanitizeNoWhitespace('email')"
          />
        </label>
        <label>
          {{ $t('page.auth.registerCode') }}
          <div class="code-field-row">
            <el-input
              class="auth-input"
              v-model.trim="registerForm.code"
              :placeholder="$t('page.auth.codePlaceholder')"
              autocomplete="off"
              @input="sanitizeNoWhitespace('code')"
            />
            <el-button
              class="send-code-btn"
              type="default"
              round
              :loading="isRegisterCodeSending"
              :disabled="isRegisterCodeSending || registerCodeCountdown > 0"
              @click="handleSendRegisterEmailCode"
            >
              {{ registerCodeCountdown > 0 ? `${registerCodeCountdown}s` : $t('page.auth.sendCode') }}
            </el-button>
          </div>
        </label>
        <label>
          {{ $t('page.auth.phone') }}
          <el-input class="auth-input" v-model.trim="registerForm.phone" :placeholder="$t('page.auth.phonePlaceholder')" @input="sanitizeNoWhitespace('phone')" />
        </label>
        <label>
          {{ $t('page.auth.realName') }}
          <el-input
            class="auth-input"
            v-model.trim="registerForm.realName"
            :placeholder="$t('page.auth.realNamePlaceholder')"
            @input="sanitizeNoWhitespace('realName')"
          />
        </label>
        <label>
          {{ $t('page.auth.gender') }}
          <select class="auth-native-input" v-model="registerForm.gender">
            <option value="">{{ $t('page.auth.genderPlaceholder') }}</option>
            <option :value="1">{{ $t('page.auth.genderMale') }}</option>
            <option :value="2">{{ $t('page.auth.genderFemale') }}</option>
          </select>
        </label>
        <label>
          {{ $t('page.auth.birthDate') }}
          <el-date-picker
            class="auth-input"
            v-model="registerForm.birthDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            :placeholder="''"
          />
        </label>
        <label>
          {{ $t('page.auth.address') }}
          <el-input
            class="auth-input"
            v-model.trim="registerForm.address"
            type="textarea"
            :rows="2"
            :placeholder="$t('page.auth.addressPlaceholder')"
            @input="sanitizeNoWhitespace('address')"
          />
        </label>
        <p class="auth-note">{{ $t('page.auth.uniqueNote') }}</p>
        <div class="auth-actions">
          <el-button type="primary" round :loading="isRegisterSubmitting" native-type="submit">
            {{ $t('page.auth.register') }}
          </el-button>
        </div>
      </template>
    </form>
  </section>
</template>

<script>
import { ElButton, ElDatePicker, ElInput } from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/date-picker/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/message/style/css'
import { loginByEmailCode, loginUser, registerUser, sendEmailCode } from '../services/authService'

export default {
  name: 'AuthView',
  components: {
    ElButton,
    ElDatePicker,
    ElInput
  },
  data() {
    return {
      authPageMode: 'login',
      loginMode: 'password',
      loginForm: {
        username: '',
        password: ''
      },
      codeLoginForm: {
        email: '',
        code: ''
      },
      registerForm: {
        username: '',
        password: '',
        email: '',
        code: '',
        phone: '',
        realName: '',
        gender: '',
        birthDate: '',
        address: ''
      },
      isLoginSubmitting: false,
      isRegisterSubmitting: false,
      isLoginCodeSending: false,
      isRegisterCodeSending: false,
      loginCodeCountdown: 0,
      registerCodeCountdown: 0,
      loginCodeTimer: null,
      registerCodeTimer: null
    }
  },
  mounted() {
    this.clearPasswordAutofill()
  },
  beforeUnmount() {
    this.clearCodeTimer('loginCodeTimer')
    this.clearCodeTimer('registerCodeTimer')
  },
  methods: {
    markWelcomeOnNextHomeVisit() {
      if (typeof window === 'undefined') return
      window.sessionStorage.setItem('tennisLabShowWelcomeOnce', '1')
    },
    showPageSuccess(message) {
      ElMessage({
        type: 'success',
        message,
        duration: 2200,
        customClass: 'tennis-auth-message tennis-auth-message--success'
      })
    },
    resolveAuthErrorMessage(error) {
      const message = String(error?.message || '').trim()
      if (!message) return this.$t('page.auth.requestFailed')
      if (/用户名已被注册|用户名已注册|username.*already.*registered|already.*registered.*username/i.test(message)) {
        return this.$t('page.auth.usernameAlreadyRegistered')
      }
      if (/邮箱已被注册|邮箱已注册|email.*already.*registered|already.*registered.*email/i.test(message)) {
        return this.$t('page.auth.emailAlreadyRegistered')
      }
      if (/用户不存在|账号不存在|未找到用户|user.*not.*found|account.*not.*found/i.test(message)) {
        return this.$t('page.auth.userNotFound')
      }
      if (/邮箱未注册|该邮箱尚未注册|email.*not.*registered|unregistered.*email/i.test(message)) {
        return this.$t('page.auth.emailNotRegistered')
      }
      if (/用户名或密码错误|账号或密码错误|密码错误|incorrect.*password|wrong.*password|invalid.*password|invalid.*credentials?/i.test(message)) {
        return this.$t('page.auth.usernameOrPasswordInvalid')
      }
      if (/验证码不能为空|请输入验证码|code.*required|verification.*code.*required/i.test(message)) {
        return this.$t('page.auth.verificationCodeRequiredServer')
      }
      if (/验证码已过期|验证码过期|验证码失效|code.*expired|verification.*code.*expired|invalid.*code.*expired/i.test(message)) {
        return this.$t('page.auth.verificationCodeExpired')
      }
      if (/验证码错误|验证码不正确|无效验证码|invalid.*verification.*code|incorrect.*verification.*code|wrong.*code/i.test(message)) {
        return this.$t('page.auth.verificationCodeInvalid')
      }
      if (/发送过于频繁|操作过于频繁|请求过于频繁|too.*many.*requests|too.*frequent|send.*too.*often/i.test(message)) {
        return this.$t('page.auth.sendCodeTooFrequently')
      }
      if (/注册失败.*(用户名|邮箱|验证码)错误|用户名[、,，]\s*邮箱或验证码错误|用户名[、,，]\s*邮箱[、,，]\s*或验证码错误/i.test(message)) {
        return this.$t('page.auth.registerIdentityInvalid')
      }
      return message
    },
    showAuthError(prefixKey, error) {
      ElMessage.error(`${this.$t(prefixKey)}：${this.resolveAuthErrorMessage(error)}`)
    },
    sanitizeNoWhitespace(field) {
      const raw = String(this.registerForm[field] || '')
      const normalized = raw.replace(/\s+/g, '')
      if (normalized !== raw) {
        this.registerForm[field] = normalized
      }
    },
    sanitizeRegisterPassword(value) {
      const raw = String(value ?? this.registerForm.password ?? '')
      const withoutWhitespace = raw.replace(/\s+/g, '')
      const withoutChinese = withoutWhitespace.replace(/[\u4e00-\u9fff]/g, '')
      if (withoutChinese !== raw) {
        this.registerForm.password = withoutChinese
      }
    },
    containsWhitespace(value) {
      return /\s/.test(String(value || ''))
    },
    containsChinese(value) {
      return /[\u4e00-\u9fff]/.test(String(value || ''))
    },
    persistAuthSession(authPayload) {
      const token = String(authPayload?.token || authPayload?.data?.token || '').trim()
      const user = authPayload?.user || authPayload?.data?.user || null
      const normalizedPayload = token ? { token, user } : {}
      localStorage.setItem('tennisLabAuth', JSON.stringify(normalizedPayload))
      window.dispatchEvent(new Event('tennislab-auth-changed'))
    },
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
    },
    clearCodeTimer(timerField) {
      if (!this[timerField]) return
      window.clearInterval(this[timerField])
      this[timerField] = null
    },
    startCodeCountdown(countdownField, timerField, seconds = 60) {
      this.clearCodeTimer(timerField)
      this[countdownField] = seconds
      this[timerField] = window.setInterval(() => {
        if (this[countdownField] <= 1) {
          this[countdownField] = 0
          this.clearCodeTimer(timerField)
          return
        }
        this[countdownField] -= 1
      }, 1000)
    },
    clearPasswordAutofill() {
      this.$nextTick(() => {
        const passwordInputs = this.$el?.querySelectorAll('input[type="password"]') || []
        passwordInputs.forEach((input) => {
          input.value = ''
        })
      })
    },
    switchAuthPage(mode) {
      this.authPageMode = mode
      if (mode === 'register') {
        this.resetRegisterForm()
        this.clearPasswordAutofill()
        return
      }
      this.resetLoginForms()
      this.clearPasswordAutofill()
    },
    switchLoginMode(mode) {
      this.loginMode = mode
    },
    validatePasswordLoginForm() {
      if (!this.loginForm.username || !this.loginForm.password) {
        ElMessage.warning(this.$t('page.auth.loginRequiredFields'))
        return false
      }
      return true
    },
    validateCodeLoginForm() {
      if (!this.codeLoginForm.email || !this.codeLoginForm.code) {
        ElMessage.warning(this.$t('page.auth.codeLoginRequiredFields'))
        return false
      }
      if (!this.isValidEmail(this.codeLoginForm.email)) {
        ElMessage.warning(this.$t('page.auth.emailInvalid'))
        return false
      }
      return true
    },
    validateRegisterForm() {
      if (!String(this.registerForm.username || '').trim()) {
        ElMessage.warning(this.$t('page.auth.usernameRequired'))
        return false
      }
      if (!String(this.registerForm.password || '').trim()) {
        ElMessage.warning(this.$t('page.auth.passwordRequired'))
        return false
      }
      if (!String(this.registerForm.email || '').trim()) {
        ElMessage.warning(this.$t('page.auth.emailRequired'))
        return false
      }
      if (!String(this.registerForm.code || '').trim()) {
        ElMessage.warning(this.$t('page.auth.registerCodeRequired'))
        return false
      }
      if (!String(this.registerForm.phone || '').trim()) {
        ElMessage.warning(this.$t('page.auth.phoneRequired'))
        return false
      }
      if (!String(this.registerForm.realName || '').trim()) {
        ElMessage.warning(this.$t('page.auth.realNameRequired'))
        return false
      }
      if (!String(this.registerForm.birthDate || '').trim()) {
        ElMessage.warning(this.$t('page.auth.birthDateRequired'))
        return false
      }
      if (!String(this.registerForm.address || '').trim()) {
        ElMessage.warning(this.$t('page.auth.addressRequired'))
        return false
      }
      if (![1, 2].includes(Number(this.registerForm.gender))) {
        ElMessage.warning(this.$t('page.auth.genderInvalid'))
        return false
      }
      const noWhitespaceFields = ['username', 'password', 'email', 'code', 'phone', 'realName', 'address']
      if (noWhitespaceFields.some((field) => this.containsWhitespace(this.registerForm[field]))) {
        ElMessage.warning(this.$t('page.auth.noWhitespaceAllowed'))
        return false
      }
      if (this.containsChinese(this.registerForm.password)) {
        ElMessage.warning(this.$t('page.auth.passwordNoChinese'))
        return false
      }
      if (!this.isValidEmail(this.registerForm.email)) {
        ElMessage.warning(this.$t('page.auth.emailInvalid'))
        return false
      }
      return true
    },
    resetRegisterForm() {
      this.registerForm = {
        username: '',
        password: '',
        email: '',
        code: '',
        phone: '',
        realName: '',
        gender: '',
        birthDate: '',
        address: ''
      }
    },
    resetLoginForms() {
      this.loginForm = {
        username: '',
        password: ''
      }
      this.codeLoginForm = {
        email: '',
        code: ''
      }
    },
    async handleSubmit() {
      if (this.authPageMode === 'register') {
        await this.handleRegister()
        return
      }
      if (this.loginMode === 'code') {
        await this.handleCodeLogin()
        return
      }
      await this.handlePasswordLogin()
    },
    async handlePasswordLogin() {
      if (this.isLoginSubmitting || !this.validatePasswordLoginForm()) return
      this.isLoginSubmitting = true
      try {
        const payload = await loginUser({
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        this.persistAuthSession(payload)
        this.markWelcomeOnNextHomeVisit()
        this.showPageSuccess(this.$t('page.auth.loginSuccess'))
        this.$router.push('/')
      } catch (error) {
        this.showAuthError('page.auth.loginFailed', error)
      } finally {
        this.isLoginSubmitting = false
      }
    },
    async handleRegister() {
      if (this.isRegisterSubmitting || !this.validateRegisterForm()) return
      this.isRegisterSubmitting = true
      try {
        await registerUser({
          username: this.registerForm.username,
          password: this.registerForm.password,
          email: this.registerForm.email,
          code: this.registerForm.code,
          phone: this.registerForm.phone,
          realName: this.registerForm.realName,
          gender: Number(this.registerForm.gender),
          birthDate: this.registerForm.birthDate,
          address: this.registerForm.address
        })
        this.showPageSuccess(this.$t('page.auth.registerSuccess'))
        this.authPageMode = 'login'
        this.loginMode = 'password'
        this.resetLoginForms()
        this.resetRegisterForm()
        this.clearPasswordAutofill()
      } catch (error) {
        this.showAuthError('page.auth.registerFailed', error)
      } finally {
        this.isRegisterSubmitting = false
      }
    },
    async handleCodeLogin() {
      if (this.isLoginSubmitting || !this.validateCodeLoginForm()) return
      this.isLoginSubmitting = true
      try {
        const payload = await loginByEmailCode({
          email: this.codeLoginForm.email,
          code: this.codeLoginForm.code
        })
        this.persistAuthSession(payload)
        this.markWelcomeOnNextHomeVisit()
        this.showPageSuccess(this.$t('page.auth.loginSuccess'))
        this.$router.push('/')
      } catch (error) {
        this.showAuthError('page.auth.loginFailed', error)
      } finally {
        this.isLoginSubmitting = false
      }
    },
    async handleSendEmailCode() {
      if (this.isLoginCodeSending || this.loginCodeCountdown > 0) return
      if (!this.codeLoginForm.email) {
        ElMessage.warning(this.$t('page.auth.emailRequiredForCode'))
        return
      }
      if (!this.isValidEmail(this.codeLoginForm.email)) {
        ElMessage.warning(this.$t('page.auth.emailInvalid'))
        return
      }
      this.isLoginCodeSending = true
      try {
        await sendEmailCode({ email: this.codeLoginForm.email })
        ElMessage.success(this.$t('page.auth.sendCodeSuccess'))
        this.startCodeCountdown('loginCodeCountdown', 'loginCodeTimer', 60)
      } catch (error) {
        this.showAuthError('page.auth.sendCodeFailed', error)
      } finally {
        this.isLoginCodeSending = false
      }
    },
    async handleSendRegisterEmailCode() {
      if (this.isRegisterCodeSending || this.registerCodeCountdown > 0) return
      if (!this.registerForm.email) {
        ElMessage.warning(this.$t('page.auth.emailRequiredForCode'))
        return
      }
      if (!this.isValidEmail(this.registerForm.email)) {
        ElMessage.warning(this.$t('page.auth.emailInvalid'))
        return
      }
      this.isRegisterCodeSending = true
      try {
        await sendEmailCode({ email: this.registerForm.email, type: 1 })
        ElMessage.success(this.$t('page.auth.sendRegisterCodeSuccess'))
        this.startCodeCountdown('registerCodeCountdown', 'registerCodeTimer', 60)
      } catch (error) {
        this.showAuthError('page.auth.sendRegisterCodeFailed', error)
      } finally {
        this.isRegisterCodeSending = false
      }
    }
  }
}
</script>

<style scoped>
.auth-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 26px 0 74px;
}

.panel {
  border-radius: 22px;
  padding: clamp(20px, 4vw, 44px);
}

.panel-tag {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
}

h3 {
  margin-top: 12px;
  font-size: clamp(1.6rem, 3.5vw, 3rem);
  line-height: 1.03;
}

p {
  margin-top: 12px;
  max-width: 520px;
  line-height: 1.6;
}

.dark {
  background: #101010;
  color: #f5f5f2;
}

.auth-intro {
  position: relative;
  overflow: hidden;
  min-height: 100%;
  background-image: url('../assets/auth-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 82%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 82%, rgba(0, 0, 0, 0) 100%);
}

.auth-intro::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.34);
  pointer-events: none;
}

.auth-intro > * {
  position: relative;
  z-index: 1;
}

.auth-form {
  border-radius: 22px;
  padding: clamp(20px, 4vw, 34px);
  background: #ffffff;
  display: grid;
  gap: 14px;
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode-switch button {
  border: 1px solid rgba(16, 16, 16, 0.18);
  border-radius: 10px;
  padding: 9px 12px;
  background: #fff;
  color: #101010;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-switch button.active {
  background: #101010;
  color: #f5f5f2;
  border-color: #101010;
}

.login-mode-switch {
  margin-top: 2px;
}

.auth-form label {
  display: grid;
  gap: 8px;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.auth-input {
  width: 100%;
}

.auth-native-input {
  width: 100%;
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 10px;
  padding: 9px 12px;
  color: #101010;
  background: #fff;
}

.auth-native-input:focus {
  outline: none;
  border-color: #101010;
}

.code-field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.send-code-btn {
  white-space: nowrap;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(16, 16, 16, 0.14) inset;
  background: rgba(255, 255, 255, 0.94);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(16, 16, 16, 0.26) inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #101010 inset;
}

.auth-form :deep(.el-input__inner::placeholder) {
  color: rgba(16, 16, 16, 0.34);
}

.auth-form :deep(.el-input__inner:-webkit-autofill),
.auth-form :deep(.el-input__inner:-webkit-autofill:hover),
.auth-form :deep(.el-input__inner:-webkit-autofill:focus),
.auth-native-input:-webkit-autofill,
.auth-native-input:-webkit-autofill:hover,
.auth-native-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #101010;
  box-shadow: 0 0 0 1000px #ffffff inset;
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
  caret-color: #101010;
  transition: background-color 9999s ease-out 0s;
}

.auth-note {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.68);
}

.auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.auth-actions :deep(.el-button) {
  border-color: rgba(16, 16, 16, 0.2);
  background: rgba(255, 255, 255, 0.9);
  color: rgba(16, 16, 16, 0.86);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.auth-actions :deep(.el-button:hover) {
  transform: translateY(-2px);
  border-color: #101010;
  background: rgba(16, 16, 16, 0.06);
  color: #101010;
}

.auth-actions :deep(.el-button--primary) {
  border-color: #101010;
  background: #101010;
  color: #f5f5f2;
}

.auth-actions :deep(.el-button--primary:hover) {
  background: rgba(16, 16, 16, 0.9);
  border-color: rgba(16, 16, 16, 0.9);
  color: #f5f5f2;
}

.auth-actions :deep(.el-button:focus-visible) {
  outline: none;
  box-shadow: 0 0 0 2px rgba(16, 16, 16, 0.18);
}

@media (max-width: 900px) {
  .auth-section {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
.tennis-auth-message {
  border-radius: 12px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  box-shadow: 0 10px 24px rgba(16, 16, 16, 0.1);
  font-size: 13px;
}

.tennis-auth-message--success {
  background: #f5f5f2;
  color: #101010;
}

.tennis-auth-message--success .el-message__icon,
.tennis-auth-message--success .el-message__content {
  color: #101010;
}
</style>
