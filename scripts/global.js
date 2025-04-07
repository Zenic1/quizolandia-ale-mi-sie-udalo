function formatData(dateTime) {
    dateTime = new Date(dateTime);
    return `${quickFormat(dateTime.getDate(), '0')}-${quickFormat(dateTime.getMonth() + 1, '0')}-${dateTime.getFullYear()} ${quickFormat(dateTime.getHours(), '0')}:${quickFormat(dateTime.getMinutes(), '0')}:${quickFormat(dateTime.getSeconds(), '0')}`;
}

function quickFormat(text, char)
{
    return (text.toString().length === 1 ? char : '') + text;
}