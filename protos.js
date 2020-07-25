/*!
 * Protos JavaScript Library v1.0.0
 * https://github.com/slavikme/protos
 *
 * Copyright © 2020 Slavik Meltser
 * Released under the MIT license
 * https://slavikme.github.io/protos/LICENSE
 *
 * Date: 2020-07-10
 */

const Protos = (() => {

    const STACK_TRACE_SPLIT_PATTERN = /(?:Error)?\n(?:\s*at\s+)?/;
    const STACK_TRACE_ROW_PATTERN1 = /^.+?\s\((.+?):\d+:\d+\)$/;
    const STACK_TRACE_ROW_PATTERN2 = /^(?:.*?@)?(.*?):\d+(?::\d+)?$/;

    const getFileParams = () => {
        const stack = new Error().stack;
        const row = stack.split(STACK_TRACE_SPLIT_PATTERN, 2)[1];
        const [, url] = row.match(STACK_TRACE_ROW_PATTERN1) || row.match(STACK_TRACE_ROW_PATTERN2) || [];
        if (!url) {
            console.warn("Something went wrong. You should debug it!");
            return;
        }
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams;
        } catch (e) {
            console.warn(`The URL '${url}' is not valid.`);
        }
    }

    const fileScriptParams = getFileParams();

    const validateOptionFromObject = (optionValue, obj, propertyNamePattern, defaultValue) => {
        const value = optionValue && optionValue.toLowerCase();
        return value && Object.keys(obj)
                .filter(name => propertyNamePattern.test(name))
                .some(name => value === obj[name])
            && value || defaultValue;
    };

    const protosList = [];
    const setAsMonitored = (obj, prop) => protosList.push({obj, prop});
    const isMonitored = (obj, prop) => protosList.some(item => item.obj === obj && item.prop === prop);

    const Protos = (parentObject, propertyName, options = {}) => {
        if (isMonitored(parentObject, propertyName)) return;
        setAsMonitored(parentObject, propertyName);

        const {configurable = false, enumerable = false} = options;
        const originalValue = parentObject[propertyName];
        parentObject['__original_' + propertyName] = originalValue;
        const valueManager = new ValueManager(originalValue);
        let isOverridden = false;

        const getSourceUrl = () => {
            const stack = new Error().stack;
            const row = stack.split(STACK_TRACE_SPLIT_PATTERN, 4).filter(v => v)[2];
            const [, url] = row.match(STACK_TRACE_ROW_PATTERN1) || row.match(STACK_TRACE_ROW_PATTERN2) || [];
            return url;
        }

        const set = newValue => {
            isOverridden = true;
            valueManager.setScopedValue(getSourceUrl(), newValue);
        };

        const get = () => isOverridden
            ? valueManager.getScopedValue(getSourceUrl())
            : valueManager.originalValue

        Object.defineProperty(parentObject, propertyName, {configurable, enumerable, set, get});
    };

    class ValueManager {
        constructor(originalValue) {
            this.originalValue = originalValue;
            this.envs = {};
        }

        getScopedValue(url) {
            return this.envs[Environment.getEnvId(url)] || this.originalValue;
        }

        setScopedValue(url, value) {
            this.envs[Environment.getEnvId(url)] = value;
        }
    }

    const Environment = {
        SCOPE_HOSTNAME: 'hostname', // Hostname Level Scope
        SCOPE_ORIGIN: 'origin', // Origin Level Scope
        SCOPE_DIRECTORY_PATH: 'dir', // Directory Path Level Scope
        SCOPE_FILE_PATH: 'file', // File Path Level Scope
        SCOPE_HREF: 'href', // Full URL Level Scope

        getEnvId: url => {
            const scopeValue = Environment._stripToScope(url);
            return scopeValue ? Symbol.for(scopeValue) : Symbol();
        },

        _stripToScope: url => {
            try {
                const urlInstance = new URL(url);
                switch (Environment.currentScope) {
                    case Environment.SCOPE_HOSTNAME:
                        return Environment._extractHostname(urlInstance);
                    case Environment.SCOPE_ORIGIN:
                        return Environment._extractOrigin(urlInstance);
                    case Environment.SCOPE_DIRECTORY_PATH:
                        return Environment._extractDirPath(urlInstance);
                    case Environment.SCOPE_FILE_PATH:
                        return Environment._extractFilePath(urlInstance);
                    case Environment.SCOPE_HREF:
                        return Environment._extractHref(urlInstance);
                }
            } catch (e) {
                // Unable to parse the url
            }
            return url;
        },
        _extractHostname: url => url.hostname,
        _extractOrigin: url => url.origin,
        _extractFilePath: url => url.origin + url.pathname,
        _extractDirPath: url => Environment._extractFilePath(url).replace(/\/[^\/]+$/, ''),
        _extractHref: url => url.href
    };

    Environment.currentScope = fileScriptParams && validateOptionFromObject(
        fileScriptParams.get('scope'),
        Environment, /^SCOPE_/,
        Environment.SCOPE_ORIGIN
    );


    return Protos;
})();

(() => {
    const commonFilterProps = ['caller', 'callee', 'arguments', 'constructor', 'length', '__proto__', '__lookupSetter__', '__lookupGetter__', '__defineSetter__', '__defineGetter__'];
    const applyOn = obj =>
        Object.getOwnPropertyNames(obj).filter(name =>
            !commonFilterProps.some(_name => name === _name)
            && typeof obj[name] === 'function'
        ).forEach(name =>
            Protos(obj, name)
        );

    applyOn(Array.prototype);
    applyOn(String.prototype);
    applyOn(Number.prototype);
    applyOn(Boolean.prototype);
    applyOn(Function.prototype);
    applyOn(BigInt.prototype);
    applyOn(Object.prototype);
    applyOn(RegExp.prototype);
})();
