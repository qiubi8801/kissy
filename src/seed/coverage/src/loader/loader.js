function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/loader/loader.js']) {
  _$jscoverage['/loader/loader.js'] = {};
  _$jscoverage['/loader/loader.js'].lineData = [];
  _$jscoverage['/loader/loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/loader.js'].lineData[34] = 0;
  _$jscoverage['/loader/loader.js'].lineData[38] = 0;
  _$jscoverage['/loader/loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader/loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/loader.js'].lineData[133] = 0;
  _$jscoverage['/loader/loader.js'].lineData[134] = 0;
  _$jscoverage['/loader/loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/loader.js'].lineData[155] = 0;
  _$jscoverage['/loader/loader.js'].lineData[156] = 0;
  _$jscoverage['/loader/loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/loader.js'].lineData[178] = 0;
}
if (! _$jscoverage['/loader/loader.js'].functionData) {
  _$jscoverage['/loader/loader.js'].functionData = [];
  _$jscoverage['/loader/loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/loader.js'].functionData[12] = 0;
}
if (! _$jscoverage['/loader/loader.js'].branchData) {
  _$jscoverage['/loader/loader.js'].branchData = {};
  _$jscoverage['/loader/loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['93'] = [];
  _$jscoverage['/loader/loader.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['118'] = [];
  _$jscoverage['/loader/loader.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['120'] = [];
  _$jscoverage['/loader/loader.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['121'] = [];
  _$jscoverage['/loader/loader.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['128'] = [];
  _$jscoverage['/loader/loader.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['129'] = [];
  _$jscoverage['/loader/loader.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['130'] = [];
  _$jscoverage['/loader/loader.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['152'] = [];
  _$jscoverage['/loader/loader.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['170'] = [];
  _$jscoverage['/loader/loader.js'].branchData['170'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['170'][1].init(17, 10, 'moduleName');
function visit484_170_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['152'][1].init(2569, 4, 'sync');
function visit483_152_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['130'][1].init(29, 4, 'sync');
function visit482_130_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['129'][1].init(25, 5, 'error');
function visit481_129_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['128'][1].init(744, 16, 'errorList.length');
function visit480_128_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['121'][1].init(29, 4, 'sync');
function visit479_121_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['120'][1].init(97, 7, 'success');
function visit478_120_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['118'][1].init(327, 3, 'ret');
function visit477_118_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['93'][1].init(247, 24, 'S.isPlainObject(success)');
function visit476_93_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['27'][1].init(76, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit475_27_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader/loader.js'].lineData[8]++;
  var Loader = S.Loader, Env = S.Env, Utils = Loader.Utils, processImmediate = S.setImmediate, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[14]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[15]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[21]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[25]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[27]++;
  if (visit475_27_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[28]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[29]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[34]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[38]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[42]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[46]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[48]++;
  S.mix(S, {
  add: function(name, factory, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[69]++;
  ComboLoader.add(name, factory, cfg, S, arguments.length);
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[85]++;
  var normalizedModNames, loader, error, sync, tryCount = 0, finalSuccess, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[93]++;
  if (visit476_93_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[95]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[97]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[99]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[102]++;
  finalSuccess = function() {
  _$jscoverage['/loader/loader.js'].functionData[8]++;
  _$jscoverage['/loader/loader.js'].lineData[103]++;
  success.apply(S, Utils.getModules(S, modNames));
};
  _$jscoverage['/loader/loader.js'].lineData[106]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[107]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[109]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[111]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[9]++;
    _$jscoverage['/loader/loader.js'].lineData[112]++;
    ++tryCount;
    _$jscoverage['/loader/loader.js'].lineData[113]++;
    var errorList = [], start = S.now(), ret;
    _$jscoverage['/loader/loader.js'].lineData[116]++;
    ret = Utils.checkModsLoadRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[117]++;
    logger.debug(tryCount + ' check duration ' + (S.now() - start));
    _$jscoverage['/loader/loader.js'].lineData[118]++;
    if (visit477_118_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[119]++;
      Utils.attachModsRecursively(normalizedModNames, S);
      _$jscoverage['/loader/loader.js'].lineData[120]++;
      if (visit478_120_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[121]++;
        if (visit479_121_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[122]++;
          finalSuccess();
        } else {
          _$jscoverage['/loader/loader.js'].lineData[125]++;
          processImmediate(finalSuccess);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[128]++;
      if (visit480_128_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[129]++;
        if (visit481_129_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[130]++;
          if (visit482_130_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[131]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[133]++;
            processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[134]++;
  error.apply(S, errorList);
});
          }
        }
        _$jscoverage['/loader/loader.js'].lineData[138]++;
        S.log('loader: load modules error:', 'error');
        _$jscoverage['/loader/loader.js'].lineData[139]++;
        S.error(errorList);
      } else {
        _$jscoverage['/loader/loader.js'].lineData[141]++;
        logger.debug(tryCount + ' reload ' + modNames);
        _$jscoverage['/loader/loader.js'].lineData[142]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[143]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[147]++;
  loader = new ComboLoader(S, waitingModules);
  _$jscoverage['/loader/loader.js'].lineData[152]++;
  if (visit483_152_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[153]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[155]++;
    processImmediate(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[156]++;
  waitingModules.notifyAll();
});
  }
  _$jscoverage['/loader/loader.js'].lineData[159]++;
  return S;
}, 
  require: function(moduleName, refName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[170]++;
  if (visit484_170_1(moduleName)) {
    _$jscoverage['/loader/loader.js'].lineData[171]++;
    var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName], refName));
    _$jscoverage['/loader/loader.js'].lineData[172]++;
    Utils.attachModsRecursively(moduleNames, S);
    _$jscoverage['/loader/loader.js'].lineData[173]++;
    return Utils.getModules(S, moduleNames)[1];
  }
}});
  _$jscoverage['/loader/loader.js'].lineData[178]++;
  Env.mods = {};
})(KISSY);
