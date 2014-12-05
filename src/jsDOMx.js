/**
 * DOM
 *
 * @jsCabLab
 *
 *  document.createElement('_').classList
 *
 * @end-jsCabLab
 *
 */

/*global define*/


/**
 * AMD.
 */
define(function() {
  'use strict';

  var JsDOMx = function(DOMDocument) {
    this.doc = DOMDocument || window.document;
    this.createNode = this.Element.bind(this);
  };

  var _pt = JsDOMx.prototype;

    /**
     * This var is used to bind elements to the optional storage argument.
     * @type {object}
     */
  var storageReference = null;

    /**
     * This var is used to apply the data parameter to inline templates.
     * @type {*}
     */
  var dataReference = null;

    /**
     * Holding all available element names.
     * @type {Object}
     */
  var elements = {};

  var templates = {};
    /**
     * Creating an element with the given name, properties and children.
     * Arguments (independent order):
     *   ByFirstChar:
     *   '#myId'           - Element get this id
     *   ':myName'         - Element will be bind to key 'myName'
     *   '.class1 and two' - Element.className will be 'class1 and two'
     *
     *   'AnyOtherString'  - Will be appended as TextNode
     *   {}                - Set all object keys as property (class, id, any)
     *   {nodeType:1}      - Will be treated as node and appended
     */
  _pt.Element = function(/*nodeName*/) {
    var _node = this.doc.createElement(arguments[0]);
    var i = 0;
    var argLength = arguments.length;
    var arg, type, firstChar, tmp;

    while (++i < argLength) {
      // iterate over all arguments

      arg = arguments[i];
      type = typeof arg;

      if (type === 'string') {
        // Process special first chars
        firstChar = arg.substring(0, 1);
        if (firstChar === '.') {
          // set class of the node

          _node.className = arg.substring(1);

        } else if (firstChar === ':') {
          // Bind this node to storage argument

          // Already checked for typeof StorageReference === 'object'
          if (storageReference === null)
            continue;

          arg = arg.substring(1);
          if (storageReference.hasOwnProperty(arg))
            throw new Error(
                'InvalidArgumentException: You try to store to ":' +
                arg + '" twice!'
            );

          storageReference[arg] = _node;

        } else {
          // Append string as TEXT_NODE

          _node.appendChild(this.doc.createTextNode(arg));
        }

      } else if (type === 'object' && (arg.nodeType === 1 || arg.nodeType === 3)) {
        // If argument is ELEMENT_NODE || TEXT_NODE append it

        _node.appendChild(arg);

      } else if (type === 'function') {
        // Execute function and add result to arguments array for processing

        if (arg.__$domtetpl === true)
          tmp = arg.call(null, elements, dataReference);
        else
          tmp = arg();

        if (tmp === undefined)
          continue;

        if (!Array.isArray(tmp))
          tmp = [tmp];

        Array.prototype.splice.apply(arguments, [i + 1, 0].concat(tmp));
        argLength = arguments.length;

      } else if (Array.isArray(arg)) {
        // Just add the content of the array to the arguments array to get
        // processed
        Array.prototype.splice.apply(arguments, [i + 1, 0].concat(arg));
        argLength = arguments.length;

      } else if (type === 'object') {
        // Set keys as attributes

        for (tmp in arg) {
          if (!arg.hasOwnProperty(tmp))
            continue;

          _node[tmp] = arg[tmp];
        }

      } else {
        throw new Error('InvalidArgumentException');
      }

    } // @end - while

    return _node;
  };

  /*
   * P U B L I C
   *=============================*/
  _pt.register = function(name, fnc) {
    templates[name] = fnc;
    return this;
  };

  /**
   *
   * @param {function} tpl
   * @param {*} data
   * @param {Object} storage
   * @return {DocumentFragment}
   */
  _pt.render = function render(tpl, data, storage) {
    // Usability feature: Throw error if we detect misused storage argument
    if (arguments.length > 3 && (
        typeof storage !== 'object' ||
        storage instanceof Array)) {
      throw new Error('InvalidArgumentException: Storage must be an object.');

    } else if (arguments.length > 3) {
      // Save reference of the storage argument to merge bindings into
      storageReference = storage;

    } else {
      // Unset storage reference for easier checking while rendering
      storageReference = null;
    }

    dataReference = data;

    if (typeof tpl === 'string')
      tpl = templates[name];

    var nodes = tpl(this.createNode);
    if (Array.isArray(nodes)) {
      var docFrag = this.doc.createDocumentFragment();
      for (var i = 0, l = nodes.length; i < l; i++)
        docFrag.appendChild(nodes[i]);

      return docFrag;
    }

    return nodes;
  };

  return new JsDOMx();
});
