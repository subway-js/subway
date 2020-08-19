
export const fromString = processorString => {
    const argName = processorString.substring(processorString.indexOf("(") + 1, processorString.indexOf(")")).split(',');
    // TODO support also non-arrow function syntax, or arrow function without curly braces
    const funcBody = processorString.substring(processorString.indexOf("{") + 1, processorString.lastIndexOf("}"));
    return new Function(argName, funcBody);
}