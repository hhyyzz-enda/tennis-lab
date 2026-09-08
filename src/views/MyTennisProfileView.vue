<template>
  <section class="profile-page">
    <div class="section-head-wrap">
      <div class="section-head">
        <p class="section-kicker">{{ $t('page.myTennisProfile.kicker') }}</p>
        <h2>{{ $t('page.myTennisProfile.title') }}</h2>
        <p class="section-lead">{{ $t('page.myTennisProfile.lead') }}</p>
      </div>
      <button type="button" class="back-home-btn" @click="goHome">
        {{ $t('page.myTennisProfile.backHome') }}
      </button>
    </div>

    <div v-if="isLoading" class="state-text">{{ $t('page.myTennisProfile.loading') }}</div>

    <div v-else-if="authRequiredError" class="state-text login-action-wrap">
      <button type="button" class="inline-login-btn" @click="goToLogin">
        {{ $t('page.myTennisProfile.goLogin') }}
      </button>
    </div>
    <div v-else-if="errorMessage" class="state-text error-text">{{ errorMessage }}</div>

    <div v-else class="profile-layout">
      <article class="profile-panel">
        <h3>{{ $t('page.myTennisProfile.basicTitle') }}</h3>
        <dl class="info-list">
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.realName') }}</dt>
            <dd>{{ displayValue(profile.realName) }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.username') }}</dt>
            <dd>{{ displayValue(profile.username) }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.gender') }}</dt>
            <dd>{{ genderText }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.birthDate') }}</dt>
            <dd>{{ displayValue(profile.birthDate) }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.address') }}</dt>
            <dd>{{ displayValue(profile.address) }}</dd>
          </div>
        </dl>
      </article>

      <article class="profile-panel">
        <h3>{{ $t('page.myTennisProfile.contactTitle') }}</h3>
        <dl class="info-list">
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.email') }}</dt>
            <dd>{{ displayValue(profile.email) }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.phone') }}</dt>
            <dd>{{ displayValue(profile.phone) }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.emailVerified') }}</dt>
            <dd>{{ emailVerifiedText }}</dd>
          </div>
          <div class="info-row">
            <dt>{{ $t('page.myTennisProfile.fields.status') }}</dt>
            <dd>{{ statusText }}</dd>
          </div>
        </dl>
      </article>

      <article class="profile-panel form-panel">
        <details class="form-collapse">
          <summary>{{ $t('page.myTennisProfile.editTitle') }}</summary>
          <form class="profile-form" @submit.prevent="handleProfileUpdate">
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.realName') }}</span>
              <input v-model.trim="profileForm.realName" type="text" />
            </label>
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.gender') }}</span>
              <select v-model="profileForm.gender">
                <option value="">{{ $t('page.myTennisProfile.genderPlaceholder') }}</option>
                <option :value="1">{{ $t('page.myTennisProfile.genderMale') }}</option>
                <option :value="2">{{ $t('page.myTennisProfile.genderFemale') }}</option>
              </select>
            </label>
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.email') }}</span>
              <input v-model.trim="profileForm.email" type="email" />
            </label>
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.phone') }}</span>
              <input v-model.trim="profileForm.phone" type="text" />
            </label>
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.birthDate') }}</span>
              <input v-model="profileForm.birthDate" type="date" />
            </label>
            <label class="form-field full-row">
              <span>{{ $t('page.myTennisProfile.fields.address') }}</span>
              <textarea v-model.trim="profileForm.address" rows="2" />
            </label>
            <div class="form-actions full-row">
              <button type="submit" class="submit-btn" :disabled="isUpdatingProfile">
                {{ isUpdatingProfile ? $t('page.myTennisProfile.updatingProfile') : $t('page.myTennisProfile.updateProfile') }}
              </button>
            </div>
          </form>
        </details>
      </article>

      <article class="profile-panel form-panel">
        <details class="form-collapse">
          <summary>{{ $t('page.myTennisProfile.passwordTitle') }}</summary>
          <form class="profile-form" @submit.prevent="handlePasswordUpdate">
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.oldPassword') }}</span>
              <input v-model="passwordForm.oldPassword" type="password" autocomplete="new-password" />
            </label>
            <label class="form-field">
              <span>{{ $t('page.myTennisProfile.fields.newPassword') }}</span>
              <input v-model="passwordForm.newPassword" type="password" autocomplete="new-password" />
            </label>
            <div class="form-actions full-row">
              <button type="submit" class="submit-btn" :disabled="isUpdatingPassword">
                {{ isUpdatingPassword ? $t('page.myTennisProfile.updatingPassword') : $t('page.myTennisProfile.updatePassword') }}
              </button>
            </div>
          </form>
        </details>
      </article>
    </div>
  </section>
</template>

<script>
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { getUserInfo, updateUserInfo, updateUserPassword } from '../services/authService'

export default {
  name: 'MyTennisProfileView',
  data() {
    return {
      isLoading: true,
      errorMessage: '',
      authRequiredError: false,
      isUpdatingProfile: false,
      isUpdatingPassword: false,
      profile: {},
      profileForm: {
        email: '',
        phone: '',
        realName: '',
        gender: '',
        birthDate: '',
        address: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: ''
      }
    }
  },
  computed: {
    genderText() {
      const gender = Number(this.profile.gender)
      if (gender === 1) return this.$t('page.myTennisProfile.genderMale')
      if (gender === 2) return this.$t('page.myTennisProfile.genderFemale')
      return this.$t('page.myTennisProfile.emptyValue')
    },
    emailVerifiedText() {
      const isVerified = Number(this.profile.emailVerified) === 1
      return isVerified ? this.$t('page.myTennisProfile.verified') : this.$t('page.myTennisProfile.unverified')
    },
    statusText() {
      const isActive = Number(this.profile.status) === 1
      return isActive ? this.$t('page.myTennisProfile.statusActive') : this.$t('page.myTennisProfile.statusInactive')
    }
  },
  mounted() {
    this.loadProfile()
  },
  methods: {
    resolveProfileError(error) {
      const message = String(error?.message || '').trim()
      if (/Internal Server Error/i.test(message)) {
        return {
          message: '',
          authRequired: true
        }
      }
      return {
        message: message || this.$t('page.auth.requestFailed'),
        authRequired: false
      }
    },
    goToLogin() {
      this.$router.push({
        path: '/auth',
        query: {
          redirect: this.$route.fullPath
        }
      })
    },
    goHome() {
      this.$router.push('/')
    },
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
    },
    syncProfileFormFromProfile() {
      const source = this.profile || {}
      this.profileForm = {
        email: String(source.email || '').trim(),
        phone: String(source.phone || '').trim(),
        realName: String(source.realName || '').trim(),
        gender: [1, 2].includes(Number(source.gender)) ? Number(source.gender) : '',
        birthDate: String(source.birthDate || '').trim(),
        address: String(source.address || '').trim()
      }
    },
    validateProfileForm() {
      const fields = ['email', 'phone', 'realName', 'birthDate', 'address']
      if (fields.some((field) => !String(this.profileForm[field] || '').trim())) {
        ElMessage.warning(this.$t('page.myTennisProfile.profileRequiredFields'))
        return false
      }
      if (![1, 2].includes(Number(this.profileForm.gender))) {
        ElMessage.warning(this.$t('page.myTennisProfile.genderInvalid'))
        return false
      }
      if (!this.isValidEmail(this.profileForm.email)) {
        ElMessage.warning(this.$t('page.myTennisProfile.emailInvalid'))
        return false
      }
      return true
    },
    validatePasswordForm() {
      if (!String(this.passwordForm.oldPassword || '').trim() || !String(this.passwordForm.newPassword || '').trim()) {
        ElMessage.warning(this.$t('page.myTennisProfile.passwordRequiredFields'))
        return false
      }
      return true
    },
    displayValue(value) {
      const text = String(value ?? '').trim()
      return text || this.$t('page.myTennisProfile.emptyValue')
    },
    async handleProfileUpdate() {
      if (this.isUpdatingProfile || !this.validateProfileForm()) return
      this.isUpdatingProfile = true
      try {
        await updateUserInfo({
          email: String(this.profileForm.email || '').trim(),
          phone: String(this.profileForm.phone || '').trim(),
          realName: String(this.profileForm.realName || '').trim(),
          gender: Number(this.profileForm.gender),
          birthDate: String(this.profileForm.birthDate || '').trim(),
          address: String(this.profileForm.address || '').trim()
        })
        this.profile = {
          ...this.profile,
          ...this.profileForm
        }
        ElMessage.success(this.$t('page.myTennisProfile.updateProfileSuccess'))
      } catch (error) {
        ElMessage.error(`${this.$t('page.myTennisProfile.updateProfileFailed')}：${error.message || this.$t('page.auth.requestFailed')}`)
      } finally {
        this.isUpdatingProfile = false
      }
    },
    async handlePasswordUpdate() {
      if (this.isUpdatingPassword || !this.validatePasswordForm()) return
      this.isUpdatingPassword = true
      try {
        await updateUserPassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        this.passwordForm = {
          oldPassword: '',
          newPassword: ''
        }
        ElMessage.success(this.$t('page.myTennisProfile.updatePasswordSuccess'))
      } catch (error) {
        ElMessage.error(`${this.$t('page.myTennisProfile.updatePasswordFailed')}：${error.message || this.$t('page.auth.requestFailed')}`)
      } finally {
        this.isUpdatingPassword = false
      }
    },
    async loadProfile() {
      this.isLoading = true
      this.errorMessage = ''
      this.authRequiredError = false
      try {
        const payload = await getUserInfo()
        this.profile = payload && typeof payload === 'object' ? payload : {}
        this.syncProfileFormFromProfile()
      } catch (error) {
        const normalizedError = this.resolveProfileError(error)
        this.errorMessage = `${this.$t('page.myTennisProfile.error')}：${normalizedError.message}`
        this.authRequiredError = normalizedError.authRequired
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 26px 0 74px;
}

.section-head-wrap {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.section-head {
  max-width: 900px;
}

.section-kicker {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.1em;
}

.section-head h2 {
  margin-top: 10px;
  font-size: clamp(1.9rem, 4vw, 3.4rem);
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.section-lead {
  margin-top: 12px;
  max-width: 680px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.72);
}

.back-home-btn {
  border: 1px solid rgba(16, 16, 16, 0.2);
  border-radius: 999px;
  min-height: 38px;
  padding: 0 16px;
  background: #101010;
  color: #f5f5f2;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.back-home-btn:hover,
.back-home-btn:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
  opacity: 0.96;
}

.state-text {
  margin-top: 24px;
  font-size: 15px;
  line-height: 1.6;
}

.error-text {
  color: #b42318;
}

.inline-login-btn {
  border: 1px solid rgba(16, 16, 16, 0.2);
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: #101010;
  color: #f5f5f2;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.login-action-wrap {
  display: flex;
  justify-content: flex-start;
}

.profile-layout {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.profile-panel {
  border-radius: 22px;
  background: #ffffff;
  padding: clamp(20px, 4vw, 34px);
}

.profile-panel h3 {
  font-size: clamp(1.2rem, 2.4vw, 1.6rem);
}

.form-panel {
  align-self: start;
}

.form-collapse {
  margin-top: 2px;
}

.form-collapse summary {
  cursor: pointer;
  font-size: clamp(1.2rem, 2.4vw, 1.6rem);
  font-weight: 700;
  list-style: none;
}

.form-collapse summary::-webkit-details-marker {
  display: none;
}

.form-collapse summary::after {
  content: '▼';
  margin-left: 8px;
  font-size: 1rem;
}

.form-collapse[open] summary::after {
  content: '▲';
}

.info-list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(16, 16, 16, 0.08);
  padding-bottom: 8px;
}

.info-row dt {
  color: rgba(16, 16, 16, 0.6);
}

.info-row dd {
  text-align: right;
  max-width: 70%;
  word-break: break-word;
}

.profile-form {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.form-field {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

.form-field span {
  color: rgba(16, 16, 16, 0.66);
}

.full-row {
  grid-column: 1 / -1;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 10px;
  padding: 9px 12px;
  color: #101010;
  background: #fff;
  font: inherit;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #101010;
}

.form-actions {
  margin-top: 4px;
  display: flex;
  justify-content: flex-start;
}

.submit-btn {
  border: 1px solid rgba(16, 16, 16, 0.2);
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: #101010;
  color: #f5f5f2;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .section-head-wrap {
    flex-direction: column;
  }

  .back-home-btn {
    text-transform: none;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-form {
    grid-template-columns: 1fr;
  }
}
</style>
