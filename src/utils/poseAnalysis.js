const POSE_INDEX = {
    leftShoulder: 11,
    rightShoulder: 12,
    leftElbow: 13,
    rightElbow: 14,
    leftWrist: 15,
    rightWrist: 16,
    leftHip: 23,
    rightHip: 24,
    leftKnee: 25,
    rightKnee: 26
}

const MIN_VISIBILITY = 0.35

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const toDegrees = (radian) => (radian * 180) / Math.PI

const getPoint = (landmarks, index) => {
    const point = landmarks?.[index]
    if (!point) return null
    if (typeof point.visibility === 'number' && point.visibility < MIN_VISIBILITY) return null
    return {
        x: point.x,
        y: point.y,
        z: point.z || 0,
        visibility: typeof point.visibility === 'number' ? point.visibility : 1
    }
}

const midpoint = (a, b) => {
    if (!a || !b) return null
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: (a.z + b.z) / 2,
        visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1)
    }
}

const vector = (from, to) => {
    if (!from || !to) return null
    return {
        x: to.x - from.x,
        y: to.y - from.y,
        z: (to.z || 0) - (from.z || 0)
    }
}

const vectorLength = (value) => {
    if (!value) return 0
    return Math.sqrt(value.x ** 2 + value.y ** 2 + value.z ** 2)
}

const angleBetweenPoints = (a, b, c) => {
    const ab = vector(b, a)
    const cb = vector(b, c)
    const lenAb = vectorLength(ab)
    const lenCb = vectorLength(cb)
    if (!lenAb || !lenCb) return null
    const cosValue = clamp((ab.x * cb.x + ab.y * cb.y + ab.z * cb.z) / (lenAb * lenCb), -1, 1)
    return toDegrees(Math.acos(cosValue))
}

const lineAngle = (a, b) => {
    if (!a || !b) return null
    const angle = Math.abs(toDegrees(Math.atan2(b.y - a.y, b.x - a.x)))
    return angle > 180 ? angle - 180 : angle
}

const angleDiff = (a, b) => {
    if (a == null || b == null) return null
    const diff = Math.abs(a - b) % 180
    return diff > 90 ? 180 - diff : diff
}

const fillMissing = (values) => {
    const out = [...values]
    let lastKnown = null
    for (let i = 0; i < out.length; i += 1) {
        if (Number.isFinite(out[i])) {
            lastKnown = out[i]
            continue
        }
        let nextIndex = i + 1
        while (nextIndex < out.length && !Number.isFinite(out[nextIndex])) {
            nextIndex += 1
        }
        const nextKnown = nextIndex < out.length ? out[nextIndex] : lastKnown
        out[i] = Number.isFinite(lastKnown) ? lastKnown : nextKnown ?? 0
    }
    return out.map((value) => (Number.isFinite(value) ? value : 0))
}

export const smoothSeries = (values, windowSize = 5) => {
    if (!Array.isArray(values) || !values.length) return []
    const normalized = fillMissing(values)
    const half = Math.floor(windowSize / 2)
    return normalized.map((_, index) => {
        let sum = 0
        let count = 0
        for (let offset = -half; offset <= half; offset += 1) {
            const sample = normalized[index + offset]
            if (!Number.isFinite(sample)) continue
            sum += sample
            count += 1
        }
        return count ? sum / count : normalized[index]
    })
}

export const calcVelocitySeries = (values, timestamps) => {
    if (!values.length || values.length !== timestamps.length) return []
    const out = new Array(values.length).fill(0)
    for (let i = 1; i < values.length; i += 1) {
        const dt = timestamps[i] - timestamps[i - 1]
        if (!dt || dt <= 0) {
            out[i] = out[i - 1] || 0
            continue
        }
        out[i] = Math.abs(values[i] - values[i - 1]) / dt
    }
    return smoothSeries(out, 7)
}

const getSeriesPeak = (values, timestamps) => {
    if (!values.length) return { value: 0, index: 0, time: 0, progress: 0 }
    let peakIndex = 0
    for (let i = 1; i < values.length; i += 1) {
        if ((values[i] || 0) > (values[peakIndex] || 0)) {
            peakIndex = i
        }
    }
    const duration = timestamps[timestamps.length - 1] || 1
    return {
        value: values[peakIndex] || 0,
        index: peakIndex,
        time: timestamps[peakIndex] || 0,
        progress: duration ? (timestamps[peakIndex] || 0) / duration : 0
    }
}

const getAverageVisibility = (frames) => {
    const visibilities = frames.flatMap((frame) =>
        (frame.landmarks || [])
            .map((point) => point?.visibility)
            .filter((value) => typeof value === 'number')
    )
    if (!visibilities.length) return 0
    const total = visibilities.reduce((sum, value) => sum + value, 0)
    return total / visibilities.length
}

const getJointPoints = (landmarks, side = 'right') => {
    const isLeft = side === 'left'
    const shoulder = getPoint(landmarks, isLeft ? POSE_INDEX.leftShoulder : POSE_INDEX.rightShoulder)
    const elbow = getPoint(landmarks, isLeft ? POSE_INDEX.leftElbow : POSE_INDEX.rightElbow)
    const wrist = getPoint(landmarks, isLeft ? POSE_INDEX.leftWrist : POSE_INDEX.rightWrist)
    const hip = getPoint(landmarks, isLeft ? POSE_INDEX.leftHip : POSE_INDEX.rightHip)

    const leftShoulder = getPoint(landmarks, POSE_INDEX.leftShoulder)
    const rightShoulder = getPoint(landmarks, POSE_INDEX.rightShoulder)
    const leftHip = getPoint(landmarks, POSE_INDEX.leftHip)
    const rightHip = getPoint(landmarks, POSE_INDEX.rightHip)
    const leftKnee = getPoint(landmarks, POSE_INDEX.leftKnee)
    const rightKnee = getPoint(landmarks, POSE_INDEX.rightKnee)

    return {
        shoulder,
        elbow,
        wrist,
        hip,
        shoulderMid: midpoint(leftShoulder, rightShoulder),
        hipMid: midpoint(leftHip, rightHip),
        kneeMid: midpoint(leftKnee, rightKnee),
        leftShoulder,
        rightShoulder,
        leftHip,
        rightHip
    }
}

const getDominantJoint = (values, peaks) => {
    const jointKeys = ['hip', 'chest', 'shoulder', 'elbow']
    return jointKeys.reduce(
        (best, key) => {
            const ratio = (values[key] || 0) / Math.max(peaks[key]?.value || 1, 1)
            if (!best || ratio > best.ratio) {
                return { key, ratio }
            }
            return best
        },
        null
    )
}

export const getPhaseKey = (values, peaks) => {
    const dominant = getDominantJoint(values, peaks)
    if (!dominant || dominant.ratio < 0.28) return 'prepare'
    return dominant.key
}

export const getValuesAtIndex = (seriesMap, index) => {
    const values = {}
    Object.keys(seriesMap).forEach((key) => {
        values[key] = seriesMap[key]?.[index] ?? 0
    })
    return values
}

const detectPromptCodes = (metrics, standard) => {
    const { peaks } = metrics
    const order = Object.entries(peaks)
        .sort(([, a], [, b]) => a.progress - b.progress)
        .map(([key]) => key)
    const codes = []

    const velocityBands = standard?.velocityBands || {}

    if ((peaks.hip?.value || 0) < (velocityBands.hip?.[0] || 8)) {
        codes.push('hip-drive-weak')
    }

    if ((peaks.hip?.value || 0) > (velocityBands.hip?.[0] || 8) * 1.25) {
        codes.push('hip-drive-good')
    }

    if ((peaks.chest?.progress || 0) - (peaks.hip?.progress || 0) > (standard?.maxHipChestGap || 0.2)) {
        codes.push('chest-transfer-late')
    }

    if (Math.abs((peaks.chest?.progress || 0) - (peaks.hip?.progress || 0)) < ((standard?.maxHipChestGap || 0.2) * 0.45)) {
        codes.push('chest-transfer-good')
    }

    if ((peaks.shoulder?.progress || 0) < (peaks.chest?.progress || 0)) {
        codes.push('shoulder-early')
    }

    if ((peaks.shoulder?.value || 0) < (peaks.chest?.value || 0) * 0.82) {
        codes.push('shoulder-underactive')
    }

    if ((peaks.elbow?.progress || 0) < (peaks.shoulder?.progress || 0)) {
        codes.push('elbow-early')
    }

    if ((peaks.elbow?.value || 0) < (peaks.shoulder?.value || 0) * 0.74) {
        codes.push('elbow-lagging')
    }

    if ((peaks.elbow?.value || 0) > (peaks.shoulder?.value || 0) * 1.35) {
        codes.push('arm-dominant')
    }

    const peakValues = ['hip', 'chest', 'shoulder', 'elbow'].map((key) => peaks[key]?.value || 0)
    const maxPeak = Math.max(...peakValues, 0)
    const minPeak = Math.min(...peakValues, 0)
    if (maxPeak > 0 && ((maxPeak - minPeak) / maxPeak) > 0.46) {
        codes.push('chain-sync-weak')
    }

    if (maxPeak > 0 && ((maxPeak - minPeak) / maxPeak) < 0.18) {
        codes.push('timing-balanced')
    }

    const expectedOrder = standard?.peakOrder || ['hip', 'chest', 'shoulder', 'elbow']
    const matchedCount = expectedOrder.filter((key, index) => order[index] === key).length
    if (matchedCount >= 3) {
        codes.push('chain-order-good')
    }

    return [...new Set(codes)].slice(0, 4)
}

export const compareWithStandard = (metrics, standard) => {
    if (!standard) {
        return {
            standardKey: 'default',
            matchedOrderCount: 0,
            order: [],
            promptCodes: []
        }
    }

    const order = Object.entries(metrics.peaks)
        .sort(([, a], [, b]) => a.progress - b.progress)
        .map(([key]) => key)

    const expectedOrder = standard.peakOrder || ['hip', 'chest', 'shoulder', 'elbow']
    const matchedOrderCount = expectedOrder.filter((key, index) => order[index] === key).length

    return {
        standardKey: standard.key || 'default',
        matchedOrderCount,
        order,
        promptCodes: detectPromptCodes(metrics, standard)
    }
}

export const analyzePoseFrames = (frames, options = {}) => {
    const side = options.side === 'left' ? 'left' : 'right'
    const timestamps = frames.map((frame) => frame.t)

    const angleSeries = {
        hip: [],
        chest: [],
        shoulder: [],
        elbow: []
    }

    frames.forEach((frame) => {
        const points = getJointPoints(frame.landmarks, side)
        const elbowAngle = angleBetweenPoints(points.shoulder, points.elbow, points.wrist)
        const shoulderAngle = angleBetweenPoints(points.elbow, points.shoulder, points.hip)
        const hipAngle = angleBetweenPoints(points.shoulderMid, points.hipMid, points.kneeMid)
        const shoulderLineAngle = lineAngle(points.leftShoulder, points.rightShoulder)
        const hipLineAngle = lineAngle(points.leftHip, points.rightHip)
        const chestAngle = angleDiff(shoulderLineAngle, hipLineAngle)

        angleSeries.elbow.push(elbowAngle)
        angleSeries.shoulder.push(shoulderAngle)
        angleSeries.hip.push(hipAngle)
        angleSeries.chest.push(chestAngle)
    })

    const smoothedAngles = {
        hip: smoothSeries(angleSeries.hip, 5),
        chest: smoothSeries(angleSeries.chest, 5),
        shoulder: smoothSeries(angleSeries.shoulder, 5),
        elbow: smoothSeries(angleSeries.elbow, 5)
    }

    const velocities = {
        hip: calcVelocitySeries(smoothedAngles.hip, timestamps),
        chest: calcVelocitySeries(smoothedAngles.chest, timestamps),
        shoulder: calcVelocitySeries(smoothedAngles.shoulder, timestamps),
        elbow: calcVelocitySeries(smoothedAngles.elbow, timestamps)
    }

    const peaks = {
        hip: getSeriesPeak(velocities.hip, timestamps),
        chest: getSeriesPeak(velocities.chest, timestamps),
        shoulder: getSeriesPeak(velocities.shoulder, timestamps),
        elbow: getSeriesPeak(velocities.elbow, timestamps)
    }

    const metrics = {
        timestamps,
        angles: smoothedAngles,
        velocities,
        peaks,
        duration: timestamps[timestamps.length - 1] || 0,
        frameCount: frames.length,
        averageVisibility: getAverageVisibility(frames)
    }

    const comparison = compareWithStandard(metrics, options.standard)

    return {
        ...metrics,
        comparison
    }
}
