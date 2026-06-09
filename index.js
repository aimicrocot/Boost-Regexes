import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { extension_settings } from '../../../extensions.js';

const EXT = 'InfoBlocks';
const EXT_KEY = 'infoblocks';
const EXT_PATH = `scripts/extensions/third-party/Boost-Regexes`;

// ── Настройки по умолчанию ─────────────────────────────────────────
const DEFAULT_SETTINGS = {
    enabled: true,
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║              КОНФИГУРАЦИЯ ТРИГГЕРОВ                              ║
// ║  Добавляй/убирай переменные и ключевые слова прямо здесь.        ║
// ║  Порядок внутри values[] важен — первое совпадение побеждает.    ║
// ╚══════════════════════════════════════════════════════════════════╝

const TRIGGERS = [

    // ── ЛОКАЦИЯ ────────────────────────────────────────────────────
    {
        variable: 'location',
        values: [
            { value: 'Лес',         keys: ['лес', 'роща', 'бор', 'чаща', 'тропинк', 'опушк', 'дерев', 'кустарник', 'папоротник'] },
            { value: 'Замок',       keys: ['замок', 'цитадел', 'крепост', 'тронн', 'башн', 'донжон', 'бойниц', 'зубц', 'ров'] },
            { value: 'Подземелье',  keys: ['подземел', 'пещер', 'туннел', 'катакомб', 'склеп', 'крипт', 'шахт', 'тёмный коридор', 'темный коридор'] },
            { value: 'Таверна',     keys: ['таверн', 'трактир', 'постоял', 'харчевн', 'кабак'] },
            { value: 'Деревня',     keys: ['деревн', 'сел', 'хутор', 'изб', 'хижин', 'сарай', 'колодец', 'плетен'] },
            { value: 'Море',        keys: ['мор', 'океан', 'корабл', 'порт', 'прибой', 'берег', 'пляж', 'волн', 'якор', 'парус'] },
            { value: 'Руины',       keys: ['руин', 'развалин', 'разруш', 'обломк', 'заброшен', 'поросш'] },
            { value: 'Горы',        keys: ['гор', 'хребет', 'вершин', 'скал', 'перевал', 'ущель', 'пропасть'] },
            { value: 'Поле',        keys: ['пол', 'луг', 'степ', 'равнин', 'просторн', 'трав', 'колос'] },
            { value: 'Болото',      keys: ['болот', 'трясин', 'топ', 'камыш', 'тряс'] },
            { value: 'Город',       keys: ['город', 'улиц', 'площад', 'рынок', 'базар', 'переулк', 'мостов', 'квартал', 'собор', 'брусчат'] },
        ]
    },

    // ── ВРЕМЯ СУТОК ────────────────────────────────────────────────
    {
        variable: 'time_of_day',
        values: [
            { value: 'Полночь',  keys: ['полночь', 'полуночн'] },
            { value: 'Ночь',     keys: ['ночь', 'ночи', 'тёмной ночи', 'ночном', 'звёзды', 'звезды', 'луна', 'лунн'] },
            { value: 'Рассвет',  keys: ['рассвет', 'на заре', 'зар', 'первые лучи', 'рассветн', 'занималась заря'] },
            { value: 'Утро',     keys: ['утр', 'поутру', 'с утра', 'утренн'] },
            { value: 'Полдень',  keys: ['полдень', 'полудн', 'в самый зенит'] },
            { value: 'День',     keys: ['средь дня', 'днём', 'среди дня', 'светлое время'] },
            { value: 'Закат',    keys: ['закат', 'на закате', 'стемнел', 'солнце сел', 'алый горизонт'] },
            { value: 'Вечер',    keys: ['вечер', 'вечером', 'вечерн'] },
            { value: 'Сумерки',  keys: ['сумерк', 'в сумерках', 'серый час'] },
        ]
    },

    // ── ПОГОДА ─────────────────────────────────────────────────────
    {
        variable: 'weather',
        values: [
            { value: 'Гроза',    keys: ['гроз', 'молни', 'гром', 'ливен', 'шторм', 'бурл'] },
            { value: 'Дождь',    keys: ['дожд', 'морось', 'ненаст', 'лило с неба', 'капли дождя'] },
            { value: 'Снег',     keys: ['снег', 'снежин', 'вьюг', 'метель', 'буран', 'сугроб', 'снегопад'] },
            { value: 'Туман',    keys: ['туман', 'мгл', 'дымк', 'пелен', 'туманн'] },
            { value: 'Ветер',    keys: ['ветер', 'порыв ветра', 'ветрен', 'завывал ветер'] },
            { value: 'Жара',     keys: ['жар', 'зной', 'пекл', 'палящ', 'знойн', 'жгучий'] },
            { value: 'Холод',    keys: ['холод', 'мороз', 'стужа', 'леден', 'морозн'] },
            { value: 'Облачно',  keys: ['облак', 'пасмурн', 'тучи', 'хмурн'] },
            { value: 'Ясно',     keys: ['ясн', 'солнечн', 'безоблачн', 'лазур', 'голубое небо', 'синее небо'] },
        ]
    },

    // ── ОБСТАНОВКА ─────────────────────────────────────────────────
    {
        variable: 'situation',
        values: [
            { value: 'Бой',           keys: ['схватк', 'атак', 'сражен', 'удар', 'клинок', 'мечо', 'стрел', 'выпад', 'парировал', 'кровь', 'рана'] },
            { value: 'Опасность',     keys: ['опасност', 'угроз', 'ловушк', 'засад', 'преследу', 'затаив дыхание'] },
            { value: 'Магия',         keys: ['заклинан', 'магич', 'волшебств', 'чар', 'рун', 'свечение', 'вспышк'] },
            { value: 'Диалог',        keys: ['сказал', 'произнёс', 'произнес', 'ответил', 'спросил', 'промолвил', 'прошептал', 'воскликнул', 'пробормотал'] },
            { value: 'Путешествие',   keys: ['шёл по дороге', 'шли', 'путник', 'в пути', 'продвигал', 'странствовал', 'верхом'] },
            { value: 'Исследование',  keys: ['изучает', 'осматривает', 'исследует', 'оглядывает', 'замечает', 'приметил', 'нашёл', 'обнаружил'] },
            { value: 'Покой',         keys: ['тишин', 'покой', 'спокойств', 'отдыха', 'дремл', 'отдыхали', 'разбили лагерь'] },
        ]
    },

];

// ╔══════════════════════════════════════════════════════════════════╗
// ║              ЛОГИКА  (не трогать)                                ║
// ╚══════════════════════════════════════════════════════════════════╝

// Обновляет отображение текущих значений в панели настроек
function updatePanelValues() {
    const context = window.SillyTavern?.getContext();
    if (!context) return;
    for (const trigger of TRIGGERS) {
        const val = context.variables?.get?.(trigger.variable) ?? '—';
        $(`#ib_val_${trigger.variable}`).text(val || '—');
    }
}

// Загружает и инициализирует настройки расширения
function loadSettings() {
    extension_settings[EXT_KEY] = extension_settings[EXT_KEY] || {};
    if (Object.keys(extension_settings[EXT_KEY]).length === 0) {
        Object.assign(extension_settings[EXT_KEY], DEFAULT_SETTINGS);
    }
    $('#infoblocks_enabled').prop('checked', extension_settings[EXT_KEY].enabled);
}

// Главная функция — обрабатывает сообщение бота
async function processMessage() {
    if (!extension_settings[EXT_KEY]?.enabled) return;

    const context = window.SillyTavern?.getContext();
    if (!context?.chat?.length) return;

    const last = context.chat[context.chat.length - 1];
    if (!last || last.is_user !== false) return;

    const text = last.mes.toLowerCase();

    for (const trigger of TRIGGERS) {
        for (const entry of trigger.values) {
            if (entry.keys.some(kw => text.includes(kw))) {
                await executeSlashCommands(`/setvar key=${trigger.variable} value=${entry.value}`);
                console.log(`[${EXT}] ${trigger.variable} → ${entry.value}`);
                break;
            }
        }
    }

    // Обновляем значения в панели (если она открыта)
    updatePanelValues();
}

// Точка входа
jQuery(async () => {
    try {
        const html = await $.get(`${EXT_PATH}/settings.html`);
        $('#extensions_settings2').append(html);

        loadSettings();

        // Чекбокс включения/выключения
        $('#infoblocks_enabled').on('change', function () {
            extension_settings[EXT_KEY].enabled = $(this).prop('checked');
            saveSettingsDebounced();
            console.log(`[${EXT}] Enabled: ${extension_settings[EXT_KEY].enabled}`);
        });

        console.log(`=== [${EXT}] Загружен ✅ (${TRIGGERS.length} переменных) ===`);
    } catch (err) {
        console.error(`[${EXT}] Ошибка загрузки:`, err);
    }
});

eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, processMessage);
