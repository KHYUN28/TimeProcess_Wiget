// 230720 Modified_KKH

const FONT_SIZE = 19;
const LINE_HEIGHT = 24;
const LABEL_WIDTH = 90;
const SPACER_SIZE = 5;
const BAR_WIDTH = 180;
const BAR_HEIGHT = 12;
const COLOR_LIGHT_GRAY = new Color('#606060', 1);
const COLOR_DARK_GRAY = new Color('#404040', 1);
const COLOR_BAR_BACKGROUND = Color.dynamic(COLOR_LIGHT_GRAY, COLOR_DARK_GRAY);
const COLOR_BAR_DEFAULT = new Color('#C0C0C0', 1);

// Process parameters
const params = (args.widgetParameter + '').split('|');

// Parameter: Colors
let colors = [];
if (params[0] !== '' && params[0] !== 'null') {
    colors = params[0].split(',').map(color => color.trim());
    colors = colors.map(color => new Color(color, 1));
} else {
    colors.push(COLOR_BAR_DEFAULT);
}
function getColors(index) {
    return colors[index % colors.length];
}

// Parameter: The week starts on Sunday
let isWeekStartsOnSunday = false;
if (params.length > 2 && params[2].toLowerCase() === 'true') {
    isWeekStartsOnSunday = true;
}

// Parameter: Labels
const now = new Date();
const labels = ['일','주','월','년'];
const calcWeekOfYear = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfFirstDay = firstDayOfYear.getDay();
    const firstWeekStart = new Date(date.getFullYear(), 0, firstDayOfYear.getDay() > 3 ? 8 - dayOfFirstDay : 1 - dayOfFirstDay);
    const dateValue = isWeekStartsOnSunday ? date.valueOf() : date.valueOf() - 86400000;
    const weekNum = Math.floor((dateValue - firstWeekStart.valueOf()) / 86400000 / 7) + 1;
    return weekNum;
};
const labelsTemplate = {
    dayOfMonth: date => {
        return date.getDate();
    },
    dayOfMonthWithZero: date => {
        const dayNum = date.getDate();
        return dayNum < 10 ? '0' + dayNum : dayNum;
    },
    dayEn: date => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    },
    dayKo: date => {
        return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    },
    weekOfYear: date => {
        let weekNum = calcWeekOfYear(date);
        if (weekNum === 0) {
            weekNum = calcWeekOfYear(new Date(date.getFullYear(), 0, 0));
        }
        return weekNum;
    },
    weekOfYearWithZero: date => {
        let weekNum = calcWeekOfYear(date);
        if (weekNum === 0) {
            weekNum = calcWeekOfYear(new Date(date.getFullYear(), 0, 0));
        }
        return weekNum < 10 ? '0' + weekNum : weekNum;
    },
    monthNum: date => {
        return date.getMonth() + 1;
    },
    monthNumWithZero: date => {
        const monthNum = date.getMonth() + 1;
        return monthNum < 10 ? '0' + monthNum : monthNum;
    },
    monthEn: date => {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    },
    year: date => {
        return date.getFullYear();
    },
};
if (params.length > 1 && params[1] !== '') {
    const paramLabels = params[1].split(',').map(label => label.trim());
    const templateRegExp = /(\${[^{}]+})/;
    for (let i = 0; i < paramLabels.length; i++) {
        while (paramLabels[i].match(templateRegExp)) {
            const template = paramLabels[i].match(templateRegExp)[0];
            const templateKey = template.replace('${', '').replace('}', '');
            const templateValue = labelsTemplate[templateKey](now);
            paramLabels[i] = paramLabels[i].replace(template, templateValue);
        }
        labels[i] = paramLabels[i];
    }
}

// Calculate date progress
function calcProgress(start, end, progress) {
    return (progress - start) / (end - start);
}

const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const dayProgress = calcProgress(dayStart, dayEnd, now);

let weekDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
if (isWeekStartsOnSunday) {
    weekDay = now.getDay();
}
const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekDay);
const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
const weekProgress = calcProgress(weekStart, weekEnd, now);

const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const monthProgress = calcProgress(monthStart, monthEnd, now);

const yearStart = new Date(now.getFullYear(), 0, 1);
const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
const yearProgress = calcProgress(yearStart, yearEnd, now);

// Create Widget
const font = Font.systemFont(FONT_SIZE);
const widget = new ListWidget();
widget.spacing = SPACER_SIZE;

function addProgress(name, progress, color) {
    const percent = Math.round(progress * 100);

    const line = widget.addStack();
    line.centerAlignContent();

    const label = line.addStack();
    label.size = new Size(LABEL_WIDTH, LINE_HEIGHT);
    label.centerAlignContent();

    const labelName = label.addText(name);
    labelName.font = font;

    label.addSpacer();

    const labelPercent = label.addText(percent + '%');
    labelPercent.font = font;

    line.addSpacer(SPACER_SIZE);

    const barBackground = line.addStack();
    barBackground.size = new Size(BAR_WIDTH, BAR_HEIGHT);
    barBackground.backgroundColor = COLOR_BAR_BACKGROUND;
    barBackground.cornerRadius = BAR_HEIGHT / 2;
    barBackground.topAlignContent();
    barBackground.layoutVertically();

    const barProgressWidth = BAR_WIDTH * progress;
    const barProgress = barBackground.addStack();
    barProgress.size = new Size(barProgressWidth, BAR_HEIGHT);
    barProgress.backgroundColor = color;
    barProgress.cornerRadius = BAR_HEIGHT / 2;
}

addProgress(labels[3], yearProgress, getColors(0));
addProgress(labels[2], monthProgress, getColors(1));
addProgress(labels[1], weekProgress, getColors(2));
addProgress(labels[0], dayProgress, getColors(3));

widget.presentMedium();
Script.setWidget(widget);