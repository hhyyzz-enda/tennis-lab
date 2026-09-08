<template>
  <section class="training-plan-page">
    <div class="section-head">
      <p class="section-kicker">{{ $t('page.aiTrainingPlan.kicker') }}</p>
      <h2>{{ $t('page.aiTrainingPlan.title') }}</h2>
      <p class="section-lead">{{ $t('page.aiTrainingPlan.lead') }}</p>
    </div>

    <div class="task-pager">
      <button
        type="button"
        :class="['task-tab', { active: activeTaskPage === 'equipment' }]"
        @click="activeTaskPage = 'equipment'"
      >
        {{ $t('page.aiTrainingPlan.tabs.equipment') }}
      </button>
      <button
        type="button"
        :class="['task-tab', { active: activeTaskPage === 'plan' }]"
        @click="activeTaskPage = 'plan'"
      >
        {{ $t('page.aiTrainingPlan.tabs.plan') }}
      </button>
      <button type="button" class="back-home-btn" @click="$router.push({ name: 'home' })">
        {{ $t('page.aiTrainingPlan.common.backHome') }}
      </button>
    </div>

    <div class="feature-grid">
      <article v-if="activeTaskPage === 'equipment'" class="feature-card">
        <p class="panel-tag">{{ $t('page.aiTrainingPlan.equipment.tag') }}</p>
        <h3>{{ $t('page.aiTrainingPlan.equipment.title') }}</h3>
        <p class="panel-desc">{{ $t('page.aiTrainingPlan.equipment.desc') }}</p>

        <form class="form-grid" @submit.prevent="handleEquipmentSubmit">
          <label>
            {{ $t('page.aiTrainingPlan.equipment.fields.height') }}
            <input
              v-model.trim="equipmentForm.height"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="$t('page.aiTrainingPlan.equipment.placeholders.height')"
              @input="sanitizeIntegerInput($event, 'equipmentForm', 'height')"
              @blur="validateIntegerFieldOnBlur('equipmentForm', 'height')"
            />
            <p v-if="fieldErrors.equipment.height" class="field-error">{{ fieldErrors.equipment.height }}</p>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.equipment.fields.weight') }}
            <input
              v-model.trim="equipmentForm.weight"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="$t('page.aiTrainingPlan.equipment.placeholders.weight')"
              @input="sanitizeIntegerInput($event, 'equipmentForm', 'weight')"
              @blur="validateIntegerFieldOnBlur('equipmentForm', 'weight')"
            />
            <p v-if="fieldErrors.equipment.weight" class="field-error">{{ fieldErrors.equipment.weight }}</p>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.equipment.fields.dominantHand') }}
            <select v-model="equipmentForm.dominantHand">
              <option value="right">{{ $t('page.aiTrainingPlan.options.hand.right') }}</option>
              <option value="left">{{ $t('page.aiTrainingPlan.options.hand.left') }}</option>
            </select>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.equipment.fields.level') }}
            <select v-model="equipmentForm.level">
              <option value="beginner">{{ $t('page.aiTrainingPlan.options.level.beginner') }}</option>
              <option value="beginnerPlus">{{ $t('page.aiTrainingPlan.options.level.beginnerPlus') }}</option>
              <option value="intermediate">{{ $t('page.aiTrainingPlan.options.level.intermediate') }}</option>
              <option value="upperIntermediate">{{ $t('page.aiTrainingPlan.options.level.upperIntermediate') }}</option>
            </select>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.equipment.fields.budget') }}
            <input
              v-model.trim="equipmentForm.budget"
              type="text"
              :placeholder="$t('page.aiTrainingPlan.equipment.placeholders.budget')"
              @input="validateBudgetInput"
              @blur="validateBudgetOnBlur"
            />
            <p class="field-hint">{{ $t('page.aiTrainingPlan.equipment.budgetHint') }}</p>
            <p v-if="fieldErrors.equipment.budget" class="field-error">{{ fieldErrors.equipment.budget }}</p>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.equipment.fields.injuryInfo') }}
            <input
              v-model.trim="equipmentForm.injuryInfo"
              type="text"
              :placeholder="$t('page.aiTrainingPlan.equipment.placeholders.injuryInfo')"
            />
          </label>
          <label class="full-span">
            {{ $t('page.aiTrainingPlan.equipment.fields.preferences') }}
            <textarea
              v-model.trim="equipmentForm.preferences"
              rows="3"
              :placeholder="$t('page.aiTrainingPlan.equipment.placeholders.preferences')"
            />
          </label>
          <button class="submit-btn" type="submit" :disabled="equipmentLoading">
            {{ equipmentLoading ? $t('page.aiTrainingPlan.common.generating') : $t('page.aiTrainingPlan.equipment.submit') }}
          </button>
        </form>

        <div v-if="equipmentAuthRequired" class="login-action-wrap">
          <button type="button" class="inline-login-btn" @click="goToLogin">
            {{ $t('page.aiTrainingPlan.common.goLogin') }}
          </button>
        </div>
        <p v-else-if="equipmentError" class="error-text">{{ equipmentError }}</p>
        <pre v-if="equipmentResult" class="result-box">{{ equipmentResult }}</pre>
      </article>

      <article v-if="activeTaskPage === 'plan'" class="feature-card">
        <p class="panel-tag">{{ $t('page.aiTrainingPlan.plan.tag') }}</p>
        <h3>{{ $t('page.aiTrainingPlan.plan.title') }}</h3>
        <p class="panel-desc">{{ $t('page.aiTrainingPlan.plan.desc') }}</p>

        <form class="form-grid" @submit.prevent="handlePlanSubmit">
          <label>
            {{ $t('page.aiTrainingPlan.plan.fields.currentLevel') }}
            <select v-model="planForm.currentLevel">
              <option value="beginner">{{ $t('page.aiTrainingPlan.options.level.beginner') }}</option>
              <option value="beginnerPlus">{{ $t('page.aiTrainingPlan.options.level.beginnerPlus') }}</option>
              <option value="intermediate">{{ $t('page.aiTrainingPlan.options.level.intermediate') }}</option>
              <option value="upperIntermediate">{{ $t('page.aiTrainingPlan.options.level.upperIntermediate') }}</option>
            </select>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.plan.fields.sessionDuration') }}
            <input
              v-model.trim="planForm.sessionDuration"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="$t('page.aiTrainingPlan.plan.placeholders.sessionDuration')"
              @input="sanitizeIntegerInput($event, 'planForm', 'sessionDuration')"
              @blur="validateIntegerFieldOnBlur('planForm', 'sessionDuration')"
            />
            <p v-if="fieldErrors.plan.sessionDuration" class="field-error">{{ fieldErrors.plan.sessionDuration }}</p>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.plan.fields.frequency') }}
            <input
              v-model.trim="planForm.frequency"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="$t('page.aiTrainingPlan.plan.placeholders.frequency')"
              @input="sanitizeIntegerInput($event, 'planForm', 'frequency')"
              @blur="validateIntegerFieldOnBlur('planForm', 'frequency')"
            />
            <p v-if="fieldErrors.plan.frequency" class="field-error">{{ fieldErrors.plan.frequency }}</p>
          </label>
          <label>
            {{ $t('page.aiTrainingPlan.plan.fields.cycle') }}
            <input
              v-model.trim="planForm.cycle"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="$t('page.aiTrainingPlan.plan.placeholders.cycle')"
              @input="sanitizeIntegerInput($event, 'planForm', 'cycle')"
              @blur="validateIntegerFieldOnBlur('planForm', 'cycle')"
            />
            <p v-if="fieldErrors.plan.cycle" class="field-error">{{ fieldErrors.plan.cycle }}</p>
          </label>
          <label class="full-span">
            {{ $t('page.aiTrainingPlan.plan.fields.goal') }}
            <textarea
              v-model.trim="planForm.goal"
              rows="3"
              :placeholder="$t('page.aiTrainingPlan.plan.placeholders.goal')"
            />
          </label>
          <label class="full-span">
            {{ $t('page.aiTrainingPlan.plan.fields.weakness') }}
            <textarea
              v-model.trim="planForm.weakness"
              rows="3"
              :placeholder="$t('page.aiTrainingPlan.plan.placeholders.weakness')"
            />
          </label>
          <button class="submit-btn" type="submit" :disabled="planLoading">
            {{ planLoading ? $t('page.aiTrainingPlan.common.generating') : $t('page.aiTrainingPlan.plan.submit') }}
          </button>
        </form>

        <div v-if="planAuthRequired" class="login-action-wrap">
          <button type="button" class="inline-login-btn" @click="goToLogin">
            {{ $t('page.aiTrainingPlan.common.goLogin') }}
          </button>
        </div>
        <p v-else-if="planError" class="error-text">{{ planError }}</p>
        <pre v-if="planResult" class="result-box">{{ planResult }}</pre>
      </article>
    </div>

    <section class="history-section">
      <div class="history-head">
        <div>
          <p class="panel-tag">{{ $t('page.aiTrainingPlan.history.tag') }}</p>
          <h3 class="history-title-lines">
            <span>{{ $t('page.aiTrainingPlan.history.titleLine1') }}</span>
            <span class="history-title-middle">{{ $t('page.aiTrainingPlan.history.titleLine2') }}</span>
            <span>{{ $t('page.aiTrainingPlan.history.titleLine3') }}</span>
          </h3>
          <p class="panel-desc">{{ $t('page.aiTrainingPlan.history.desc') }}</p>
        </div>
        <button class="refresh-btn" type="button" @click="loadHistory" :disabled="historyLoading">
          {{ historyLoading ? $t('page.aiTrainingPlan.common.loading') : $t('page.aiTrainingPlan.history.refresh') }}
        </button>
      </div>

      <div v-if="historyAuthRequired" class="login-action-wrap">
        <button type="button" class="inline-login-btn" @click="goToLogin">
          {{ $t('page.aiTrainingPlan.common.goLogin') }}
        </button>
      </div>
      <p v-else-if="historyError" class="error-text">{{ historyError }}</p>

      <div v-if="historyList.length" class="history-list">
        <article
          v-for="(item, index) in pagedHistoryList"
          :key="item.id || `${item.createTime || item.createdAt || ''}-${index}`"
          class="history-card"
        >
          <div class="history-card-head">
            <p class="history-time">{{ formatHistoryTime(item.createTime || item.createdAt) }}</p>
            <button type="button" class="history-toggle-btn" @click="openHistoryDetail(item)">
              {{ $t('page.aiTrainingPlan.history.detail') }}
            </button>
          </div>
          <p class="history-preview">{{ getHistoryPreview(item) }}</p>
        </article>
      </div>
      <p v-else-if="!historyLoading" class="empty-text">{{ $t('page.aiTrainingPlan.history.empty') }}</p>

      <div class="pager">
        <button type="button" :disabled="!canPrev || historyLoading" @click="goPrevPage">{{ $t('page.aiTrainingPlan.history.prev') }}</button>
        <span>{{ $t('page.aiTrainingPlan.history.pageStatus', { current: page, total: pages || 1 }) }}</span>
        <button type="button" :disabled="!canNext || historyLoading" @click="goNextPage">{{ $t('page.aiTrainingPlan.history.next') }}</button>
      </div>

      <div v-if="historyDetailItem" class="history-modal-mask" @click.self="closeHistoryDetail">
        <article class="history-modal">
          <div class="history-modal-head">
            <p class="history-modal-title">{{ $t('page.aiTrainingPlan.history.detailDialogTitle') }}</p>
            <button type="button" class="history-modal-close-btn" @click="closeHistoryDetail">
              {{ $t('page.aiTrainingPlan.history.close') }}
            </button>
          </div>
          <p class="history-time">{{ formatHistoryTime(historyDetailItem.createTime || historyDetailItem.createdAt) }}</p>
          <pre class="history-response">{{ getHistoryContent(historyDetailItem) }}</pre>
        </article>
      </div>
    </section>
  </section>
</template>

<script>
import { fetchTrainingPlans, generateTrainingPlan } from '../services/trainingPlanService'

export default {
  name: 'AiTrainingPlanView',
  data() {
    return {
      equipmentLoading: false,
      planLoading: false,
      historyLoading: false,
      equipmentError: '',
      planError: '',
      historyError: '',
      equipmentAuthRequired: false,
      planAuthRequired: false,
      historyAuthRequired: false,
      equipmentResult: '',
      planResult: '',
      fieldErrors: {
        equipment: {
          height: '',
          weight: '',
          budget: ''
        },
        plan: {
          sessionDuration: '',
          frequency: '',
          cycle: ''
        }
      },
      equipmentForm: {
        height: '',
        weight: '',
        dominantHand: 'right',
        level: 'beginner',
        budget: '',
        injuryInfo: '',
        preferences: ''
      },
      planForm: {
        currentLevel: 'beginner',
        sessionDuration: '',
        frequency: '',
        cycle: '',
        goal: '',
        weakness: ''
      },
      historyList: [],
      historyDetailItem: null,
      activeTaskPage: 'equipment',
      page: 1,
      size: 3,
      pages: 1
    }
  },
  computed: {
    pagedHistoryList() {
      const start = (this.page - 1) * this.size
      return this.historyList.slice(start, start + this.size)
    },
    canPrev() {
      return this.page > 1
    },
    canNext() {
      return this.page < this.pages
    }
  },
  mounted() {
    this.loadHistory()
  },
  methods: {
    resolveRequestError(error, fallbackMessage) {
      const message = String(error?.message || '').trim()
      if (/Internal Server Error/i.test(message)) {
        return {
          message: '',
          authRequired: true
        }
      }
      return {
        message: message || fallbackMessage,
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
    isEnglishLocale() {
      const locale = String(this.$i18n?.locale || '')
      return locale.toLowerCase().startsWith('en')
    },
    getPromptFallbackText(type) {
      const en = this.isEnglishLocale()
      if (type === 'empty') return en ? 'Not provided' : '未填写'
      if (type === 'none') return en ? 'None' : '无'
      return ''
    },
    clearFieldError(groupKey, fieldKey) {
      if (this.fieldErrors?.[groupKey]?.[fieldKey]) {
        this.fieldErrors[groupKey][fieldKey] = ''
      }
    },
    setFieldError(groupKey, fieldKey, message) {
      if (this.fieldErrors?.[groupKey]?.[fieldKey] !== undefined) {
        this.fieldErrors[groupKey][fieldKey] = message
      }
    },
    resetFieldErrors(groupKey) {
      const group = this.fieldErrors?.[groupKey]
      if (!group) return
      Object.keys(group).forEach((key) => {
        group[key] = ''
      })
    },
    getIntegerFieldRule(formKey, fieldKey) {
      const rules = {
        equipmentForm: {
          height: {
            min: 100,
            max: 250,
            requiredKey: 'page.aiTrainingPlan.validation.heightRequired',
            rangeKey: 'page.aiTrainingPlan.validation.heightRange',
            errorGroup: 'equipment'
          },
          weight: {
            min: 30,
            max: 200,
            requiredKey: 'page.aiTrainingPlan.validation.weightRequired',
            rangeKey: 'page.aiTrainingPlan.validation.weightRange',
            errorGroup: 'equipment'
          }
        },
        planForm: {
          sessionDuration: {
            min: 10,
            max: 300,
            requiredKey: 'page.aiTrainingPlan.validation.durationRequired',
            rangeKey: 'page.aiTrainingPlan.validation.durationRange',
            errorGroup: 'plan'
          },
          frequency: {
            min: 1,
            max: 14,
            requiredKey: 'page.aiTrainingPlan.validation.frequencyRequired',
            rangeKey: 'page.aiTrainingPlan.validation.frequencyRange',
            errorGroup: 'plan'
          },
          cycle: {
            min: 1,
            max: 52,
            requiredKey: 'page.aiTrainingPlan.validation.cycleRequired',
            rangeKey: 'page.aiTrainingPlan.validation.cycleRange',
            errorGroup: 'plan'
          }
        }
      }
      return rules?.[formKey]?.[fieldKey] || null
    },
    validateIntegerFieldOnBlur(formKey, fieldKey) {
      const rule = this.getIntegerFieldRule(formKey, fieldKey)
      if (!rule) return
      const message = this.validateIntegerRange(
        this[formKey]?.[fieldKey],
        rule.requiredKey,
        rule.rangeKey,
        rule.min,
        rule.max
      )
      if (message) {
        this.setFieldError(rule.errorGroup, fieldKey, message)
      } else {
        this.clearFieldError(rule.errorGroup, fieldKey)
      }
    },
    sanitizeIntegerInput(event, formKey, fieldKey) {
      const rawValue = String(event?.target?.value || '')
      const normalized = rawValue.replace(/\D+/g, '')
      this[formKey][fieldKey] = normalized
      const rule = this.getIntegerFieldRule(formKey, fieldKey)
      const errorGroup = rule?.errorGroup
      if (errorGroup) {
        if (!normalized) {
          this.clearFieldError(errorGroup, fieldKey)
        } else if (rawValue !== normalized) {
          this.setFieldError(errorGroup, fieldKey, this.$t('page.aiTrainingPlan.validation.integerOnly'))
        } else {
          const numeric = Number(normalized)
          if (numeric < rule.min || numeric > rule.max) {
            this.setFieldError(
              errorGroup,
              fieldKey,
              this.$t(rule.rangeKey, { min: rule.min, max: rule.max })
            )
          } else {
            this.clearFieldError(errorGroup, fieldKey)
          }
        }
      }
      if (event?.target && event.target.value !== normalized) {
        event.target.value = normalized
      }
    },
    validateBudgetInput() {
      const normalized = String(this.equipmentForm.budget || '').trim()
      if (!normalized) {
        this.clearFieldError('equipment', 'budget')
        return
      }
      const message = this.validateBudget(normalized)
      if (message) {
        this.setFieldError('equipment', 'budget', message)
      } else {
        this.clearFieldError('equipment', 'budget')
      }
    },
    validateBudgetOnBlur() {
      const message = this.validateBudget(this.equipmentForm.budget)
      if (message) {
        this.setFieldError('equipment', 'budget', message)
      } else {
        this.clearFieldError('equipment', 'budget')
      }
    },
    validateIntegerRange(value, requiredKey, rangeKey, min, max) {
      const normalized = String(value || '').trim()
      if (!normalized) {
        return this.$t(requiredKey)
      }
      if (!/^\d+$/.test(normalized)) {
        return this.$t('page.aiTrainingPlan.validation.integerOnly')
      }
      const numeric = Number(normalized)
      if (numeric < min || numeric > max) {
        return this.$t(rangeKey, { min, max })
      }
      return ''
    },
    validateBudget(value) {
      const normalized = String(value || '').trim()
      if (!normalized) {
        return this.$t('page.aiTrainingPlan.validation.budgetRequired')
      }
      const budgetPattern = /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*([A-Za-z]{2,8}|元|人民币|RMB|CNY|USD)$/i
      if (!budgetPattern.test(normalized)) {
        return this.$t('page.aiTrainingPlan.validation.budgetFormat')
      }
      return ''
    },
    validateEquipmentForm() {
      const errors = {
        height: this.validateIntegerRange(
        this.equipmentForm.height,
        'page.aiTrainingPlan.validation.heightRequired',
        'page.aiTrainingPlan.validation.heightRange',
        100,
        250
      ),
        weight: this.validateIntegerRange(
        this.equipmentForm.weight,
        'page.aiTrainingPlan.validation.weightRequired',
        'page.aiTrainingPlan.validation.weightRange',
        30,
        200
      ),
        budget: this.validateBudget(this.equipmentForm.budget)
      }
      return errors
    },
    validatePlanForm() {
      const errors = {
        sessionDuration: this.validateIntegerRange(
        this.planForm.sessionDuration,
        'page.aiTrainingPlan.validation.durationRequired',
        'page.aiTrainingPlan.validation.durationRange',
        10,
        300
      ),
        frequency: this.validateIntegerRange(
        this.planForm.frequency,
        'page.aiTrainingPlan.validation.frequencyRequired',
        'page.aiTrainingPlan.validation.frequencyRange',
        1,
        14
      ),
        cycle: this.validateIntegerRange(
        this.planForm.cycle,
        'page.aiTrainingPlan.validation.cycleRequired',
        'page.aiTrainingPlan.validation.cycleRange',
        1,
        52
      )
      }
      return errors
    },
    findFirstError(errorMap) {
      const firstKey = Object.keys(errorMap).find((key) => Boolean(errorMap[key]))
      return firstKey ? errorMap[firstKey] : ''
    },
    buildEquipmentRequirements() {
      const payload = this.equipmentForm
      const en = this.isEnglishLocale()
      const emptyText = this.getPromptFallbackText('empty')
      const noneText = this.getPromptFallbackText('none')
      return [
        ...(en
          ? [
              'You are a professional tennis equipment advisor. Follow all instructions strictly.',
              'Task: Recommend 3-5 tennis racquet options based on user information.',
              'Each option must include: brand, model, suitable user profile, reasons, suggested string tension, budget fit, and purchase link (full URL).',
              'Output must follow this structure:',
              '1) User profile summary',
              '2) Recommendation list (3-5 options)',
              '3) Primary choice and backup choices',
              '4) Purchase notes (2-4 items)',
              'Requirements: concise, practical, and only racquet-related content.'
            ]
          : [
              '你是专业网球装备顾问，请严格按要求输出。',
              '任务：根据用户信息推荐 3-5 套网球拍方案。',
              '每套必须包含：品牌、型号、适用人群、推荐理由、建议拉线磅数、预算匹配度、购买链接（完整 URL）。',
              '输出格式必须是：',
              '一、用户画像总结',
              '二、推荐清单（3-5 套）',
              '三、首选方案与备选方案',
              '四、购买注意事项（2-4 条）',
              '要求：语言简洁、可执行，不要输出与网球拍无关内容。'
            ]),
        `${en ? 'Height' : '身高'}：${payload.height || emptyText}`,
        `${en ? 'Weight' : '体重'}：${payload.weight || emptyText}`,
        `${en ? 'Dominant hand' : '惯用手'}：${this.getHandLabel(payload.dominantHand)}`,
        `${en ? 'Current level' : '当前水平'}：${this.getLevelLabel(payload.level)}`,
        `${en ? 'Budget range' : '预算范围'}：${payload.budget || emptyText}`,
        `${en ? 'Injury/discomfort' : '伤病或不适'}：${payload.injuryInfo || noneText}`,
        `${en ? 'Additional preferences' : '补充偏好'}：${payload.preferences || noneText}`
      ].join('\n')
    },
    buildPlanRequirements() {
      const payload = this.planForm
      const en = this.isEnglishLocale()
      const emptyText = this.getPromptFallbackText('empty')
      return [
        ...(en
          ? [
              'You are a professional tennis coach. Output a personalized training plan sheet strictly as requested.',
              'Task: Build a phased weekly plan based on user level and available training time.',
              'Must include: overall goal, phase goals, weekly schedule (technique/fitness/tactics), session duration, weekly frequency, phase acceptance criteria, and notes.',
              'Output must follow this structure:',
              '1) User status and goals',
              '2) Training plan sheet (by week or phase)',
              '3) Weekly execution checklist',
              '4) Phase acceptance criteria',
              '5) Risk control and recovery advice',
              'Requirements: specific and actionable. Avoid generic suggestions.'
            ]
          : [
              '你是专业网球教练，请严格按要求输出“个性化训练计划单”。',
              '任务：依据用户当前水平与时间安排，生成分阶段周计划。',
              '必须包含：总目标、阶段目标、每周安排（技术/体能/战术）、每次时长、每周频次、阶段验收标准、注意事项。',
              '输出格式必须是：',
              '一、用户现状与目标',
              '二、训练计划单（按周或按阶段）',
              '三、每周执行清单',
              '四、阶段验收标准',
              '五、风险与恢复建议',
              '要求：内容具体可执行，避免空泛建议。'
            ]),
        `${en ? 'Current level' : '当前水平'}：${this.getLevelLabel(payload.currentLevel)}`,
        `${en ? 'Session duration' : '每次可训练时长'}：${payload.sessionDuration || emptyText}`,
        `${en ? 'Weekly frequency' : '每周训练频率'}：${payload.frequency || emptyText}`,
        `${en ? 'Plan cycle' : '计划周期'}：${payload.cycle || emptyText}`,
        `${en ? 'Goal' : '目标'}：${payload.goal || emptyText}`,
        `${en ? 'Current weakness' : '当前短板'}：${payload.weakness || emptyText}`
      ].join('\n')
    },
    async handleEquipmentSubmit() {
      this.equipmentError = ''
      this.equipmentAuthRequired = false
      this.resetFieldErrors('equipment')
      const validationErrors = this.validateEquipmentForm()
      this.fieldErrors.equipment = { ...this.fieldErrors.equipment, ...validationErrors }
      const firstError = this.findFirstError(validationErrors)
      if (firstError) {
        this.equipmentError = this.$t('page.aiTrainingPlan.validation.fixForm')
        return
      }
      this.equipmentLoading = true
      try {
        const requirements = this.buildEquipmentRequirements()
        const data = await generateTrainingPlan(requirements)
        this.equipmentResult = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        await this.loadHistory()
      } catch (error) {
        const normalizedError = this.resolveRequestError(error, this.$t('page.aiTrainingPlan.equipment.error'))
        this.equipmentError = normalizedError.message
        this.equipmentAuthRequired = normalizedError.authRequired
      } finally {
        this.equipmentLoading = false
      }
    },
    async handlePlanSubmit() {
      this.planError = ''
      this.planAuthRequired = false
      this.resetFieldErrors('plan')
      const validationErrors = this.validatePlanForm()
      this.fieldErrors.plan = { ...this.fieldErrors.plan, ...validationErrors }
      const firstError = this.findFirstError(validationErrors)
      if (firstError) {
        this.planError = this.$t('page.aiTrainingPlan.validation.fixForm')
        return
      }
      this.planLoading = true
      try {
        const requirements = this.buildPlanRequirements()
        const data = await generateTrainingPlan(requirements)
        this.planResult = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        await this.loadHistory()
      } catch (error) {
        const normalizedError = this.resolveRequestError(error, this.$t('page.aiTrainingPlan.plan.error'))
        this.planError = normalizedError.message
        this.planAuthRequired = normalizedError.authRequired
      } finally {
        this.planLoading = false
      }
    },
    async loadHistory() {
      this.historyLoading = true
      this.historyError = ''
      this.historyAuthRequired = false
      try {
        const payload = await fetchTrainingPlans({ page: 1, size: 120 })
        const records = Array.isArray(payload?.records) ? payload.records : []
        this.historyList = [...records].sort((a, b) => {
          const aTime = new Date(a?.createTime || a?.createdAt || 0).getTime()
          const bTime = new Date(b?.createTime || b?.createdAt || 0).getTime()
          const byTime = (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0)
          if (byTime !== 0) return byTime
          return Number(b?.id || 0) - Number(a?.id || 0)
        })
        this.page = 1
        this.historyDetailItem = null
        this.recalculateHistoryPages()
      } catch (error) {
        const normalizedError = this.resolveRequestError(error, this.$t('page.aiTrainingPlan.history.error'))
        this.historyError = normalizedError.message
        this.historyAuthRequired = normalizedError.authRequired
        this.recalculateHistoryPages()
      } finally {
        this.historyLoading = false
      }
    },
    recalculateHistoryPages() {
      const total = Math.ceil(this.historyList.length / this.size)
      this.pages = Math.max(total, 1)
      if (this.page > this.pages) {
        this.page = this.pages
      }
      if (this.page < 1) {
        this.page = 1
      }
    },
    getHistoryContent(item) {
      return String(item?.responseContent || item?.errorMessage || '-')
    },
    getHistoryPreview(item) {
      const content = this.getHistoryContent(item).replace(/\s+/g, ' ').trim()
      if (!content) return '-'
      const maxLength = 68
      return content.length > maxLength ? `${content.slice(0, maxLength)}...` : content
    },
    openHistoryDetail(item) {
      this.historyDetailItem = item || null
    },
    closeHistoryDetail() {
      this.historyDetailItem = null
    },
    formatHistoryTime(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getLevelLabel(value) {
      const keyMap = {
        beginner: 'beginner',
        beginnerPlus: 'beginnerPlus',
        intermediate: 'intermediate',
        upperIntermediate: 'upperIntermediate'
      }
      const normalized = keyMap[value] || 'beginner'
      return this.$t(`page.aiTrainingPlan.options.level.${normalized}`)
    },
    getHandLabel(value) {
      const keyMap = {
        right: 'right',
        left: 'left'
      }
      const normalized = keyMap[value] || 'right'
      return this.$t(`page.aiTrainingPlan.options.hand.${normalized}`)
    },
    goPrevPage() {
      if (!this.canPrev) return
      this.page -= 1
      this.historyDetailItem = null
    },
    goNextPage() {
      if (!this.canNext) return
      this.page += 1
      this.historyDetailItem = null
    }
  }
}
</script>

<style scoped>
.training-plan-page {
  padding: 26px 0 74px;
}

.section-head {
  max-width: 960px;
}

.back-home-btn {
  margin-left: auto;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: #fff;
  color: #101010;
  border-radius: 999px;
  min-height: 38px;
  padding: 0 14px;
  cursor: pointer;
  font: inherit;
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
  max-width: 760px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.72);
}

.feature-grid {
  margin-top: 24px;
  display: block;
}

.task-pager {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.task-tab {
  border: 1px solid rgba(16, 16, 16, 0.16);
  background: #fff;
  color: #101010;
  border-radius: 999px;
  min-height: 38px;
  padding: 0 14px;
  cursor: pointer;
}

.task-tab.active {
  background: #101010;
  color: #f5f5f2;
}

.feature-card,
.history-section {
  border-radius: 22px;
  padding: clamp(20px, 4vw, 34px);
  background: #ffffff;
}

.panel-tag {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
}

h3 {
  margin-top: 12px;
  font-size: clamp(1.4rem, 2.8vw, 2rem);
  line-height: 1.1;
}

.panel-desc {
  margin-top: 10px;
  line-height: 1.6;
  color: rgba(16, 16, 16, 0.75);
}

.form-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

input,
select,
textarea {
  border: 1px solid rgba(16, 16, 16, 0.18);
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  color: #101010;
  font: inherit;
}

textarea {
  resize: vertical;
  min-height: 88px;
}

.full-span {
  grid-column: span 2;
}

.submit-btn,
.refresh-btn,
.pager button {
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: #101010;
  color: #f5f5f2;
  border-radius: 999px;
  min-height: 40px;
  padding: 0 16px;
  cursor: pointer;
}

.submit-btn:disabled,
.refresh-btn:disabled,
.pager button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  grid-column: span 2;
}

.error-text {
  margin-top: 12px;
  color: #c0352b;
  font-size: 13px;
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
  margin-top: 12px;
  display: flex;
  justify-content: flex-start;
}

.field-hint {
  margin: -2px 0 0;
  color: rgba(16, 16, 16, 0.6);
  font-size: 12px;
}

.field-error {
  margin: -2px 0 0;
  color: #c0352b;
  font-size: 12px;
}

.result-box {
  margin-top: 12px;
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: #fafaf8;
  padding: 12px;
  white-space: pre-wrap;
  line-height: 1.55;
}

.history-section {
  margin-top: 16px;
}

.history-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.history-title-lines {
  display: inline-grid;
  gap: 2px;
}

.history-title-lines span {
  display: block;
}

.history-title-middle {
  justify-self: center;
}

.refresh-btn {
  background: #ffffff;
  color: #101010;
}

.history-list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.history-card {
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.1);
  background: #fafaf8;
  padding: 12px;
}

.history-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.history-time {
  margin: 0;
  color: rgba(16, 16, 16, 0.62);
  font-size: 12px;
}

.history-toggle-btn {
  border: 1px solid rgba(16, 16, 16, 0.18);
  border-radius: 999px;
  min-height: 28px;
  padding: 0 10px;
  background: #fff;
  color: #101010;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.history-preview {
  margin: 10px 0 0;
  line-height: 1.55;
  color: rgba(16, 16, 16, 0.84);
  font-size: 13px;
}

.history-response {
  margin-top: 10px;
  background: #fff;
  border: 1px solid rgba(16, 16, 16, 0.08);
  border-radius: 12px;
  padding: 10px;
  white-space: pre-wrap;
  line-height: 1.55;
}

.history-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(16, 16, 16, 0.46);
  display: grid;
  place-items: center;
  z-index: 60;
  padding: 18px;
}

.history-modal {
  width: min(760px, 100%);
  max-height: min(78vh, 760px);
  overflow: auto;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(16, 16, 16, 0.12);
  padding: 16px;
}

.history-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.history-modal-title {
  margin: 0;
  font-weight: 700;
}

.history-modal-close-btn {
  border: 1px solid rgba(16, 16, 16, 0.18);
  border-radius: 999px;
  min-height: 30px;
  padding: 0 12px;
  background: #101010;
  color: #f5f5f2;
  cursor: pointer;
}

.empty-text {
  margin-top: 14px;
  color: rgba(16, 16, 16, 0.7);
}

.pager {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.pager button {
  min-height: 34px;
  padding: 0 12px;
}

@media (max-width: 900px) {
  .back-home-btn {
    margin-left: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-span,
  .submit-btn {
    grid-column: span 1;
  }

  .history-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .history-list {
    grid-template-columns: 1fr;
  }
}
</style>
