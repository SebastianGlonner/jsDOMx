(function (_tf) {

	_tf.module('test', {

		setup: function() {

		},

		teardown: function() {

		}
	});

	test("error message giving inappropriate storage argument", 6, function() {

		try {
			DOMTE.render(function t13 () {});
			ok(true);
		} catch(error) {
			throw new Error('This error should not happen: '+ error.message);
		}

		var definedButUnset;

		var tries = [
			null,
			undefined,
			definedButUnset,
			[],
			1
		];
		for ( var i = 0; i < tries.length; i++ ) {
			try {
				DOMTE.render(null, null, tries[i]);

			} catch(error) {
				equal(error.message, 'InvalidArgumentException: Storage must be an object.');
			}
		}
	});


	test("deep element storing", 6, function() {
		var
			storage = {},
			res = DOMTE.render(function t15 () {
				return div(
					':myDiv',
					'#myId',
					'.myclass seccondclass',
					{'id':'myId2'},

					div(
						':myDiv2',
						'.myclass seccondclass',
						{'id':'myId2'},

						div(
							':myDiv3'

						)
					)

				);
			}, null, storage)
		; // @var

		equal(typeof storage.myDiv, 'object');
		equal(storage.myDiv.nodeType, 1);

		equal(typeof storage.myDiv2, 'object');
		equal(storage.myDiv2.nodeType, 1);

		equal(typeof storage.myDiv3, 'object');
		equal(storage.myDiv3.nodeType, 1);
	});

	test("informative error on storing without storage argument", 1, function() {
		throws(function() {
			DOMTE.render(function t16 () {
				return div(
					':myDiv',

					div(':myDiv')
				);
			});
		},
		/InvalidArgumentException.*myDiv" without given storage argument!/);
	});

	test("informative error on ambiguous storing", 1, function() {
		throws(function() {
			DOMTE.render(function t17 () {
				return div(
					':myDiv',

					div(
						p(':myDiv')
					)
				);
			}, null, {});
		},
		/InvalidArgumentException.*myDiv/);
	});

	test("support any return type", 1, function() {
		var res = DOMTE.render(function t18 () {
			return [
				div(
					'.modal fade'

				),

				div('.modal2 fade2')
			];
		});

		equal(res.length, 2);
	});

	test("can append text nodes", 1, function() {
		var res = DOMTE.render(function t19 () {
			return div(
				'.modal fade',
				document.createTextNode('anyTextNode')
			);
		});

		equal(res.innerHTML, 'anyTextNode');
	});

	test("can append text nodes", 8, function() {
		var attr = {
			htmlFor: 'htmlFor_',
			className: 'className_',
			readOnly: 'readOnly_',
			maxLength: 'maxLength_',
			cellSpacing: 'cellSpacing_',
			rowSpan: 'rowSpan_',
			colSpan: 'colSpan_'
		};

		var res = DOMTE.render(function t20 () {
			return div({
				htmlFor: 'htmlFor_',
				className: 'className_',
				readOnly: 'readOnly_',
				maxLength: 'maxLength_',
				cellSpacing: 'cellSpacing_',
				rowSpan: 'rowSpan_',
				colSpan: 'colSpan_',
			}, {
				tabIndex: 4
			});
		});

		for ( var a in attr ) {
			if ( !attr.hasOwnProperty(a) )
				continue;

			equal(res[a], a+'_');
		}

		equal(res.tabIndex, 4);
	});

	test("reuse registered template", 1, function() {
		var tpl = DOMTE.register(function t21 () {
			return div(
				'.modal fade',
				document.createTextNode('anyTextNode')
			);
		});

		var res = DOMTE.render(tpl);
		equal(res.innerHTML, 'anyTextNode');
	});

	test("setting different data on reused templates", 2, function() {
		var tpl = DOMTE.register(function t22 (_, data) {
			return div(
				document.createTextNode(data.text)
			);
		});

		equal(DOMTE.render(tpl, {text: 'anyTextNode'}).innerHTML, 'anyTextNode');
		equal(DOMTE.render(tpl, {text: 'anyOtherText'}).innerHTML, 'anyOtherText');
	});

	test("reused templates are independent and not referenced", 2, function() {
		var tpl = DOMTE.register(function t23 () {
			return div(
				p(),
				span()
			);
		});

		var tpl1 = DOMTE.render(tpl);
		var tpl2 = DOMTE.render(tpl);

		tpl1.removeChild(tpl1.childNodes[1]);
		equal(tpl1.childNodes.length, 1);
		equal(tpl2.childNodes.length, 2);
	});

	test("render inline function", 1, function() {
		var res = DOMTE.render(function t24 (_, data) {
			return div(
				ul(function() {
					return li(data.content);
				})
			);
		}, {content:'myText'});

		equal(res.innerHTML, '<ul><li>myText</li></ul>');

	});

	test("ignore inline function returning no value", 1, function() {
		var res = DOMTE.render(function t25 (_, data) {
			return div(
				ul(function() {
					li(data.content);
				})
			);
		}, {content:'myText'});

		equal(res.innerHTML, '<ul></ul>');

	});

	test("can handle array arguments", 1, function() {
		var res = DOMTE.render(function t26 (_, data) {
			return div(
				[span(), p(), function() {return div();}],
				h1()
			);
		});

		equal(res.innerHTML, '<span></span><p></p><div></div><h1></h1>');
	});

	test("can handle nested inline functions", 1, function() {
		var res = DOMTE.render(function t27 (_, data) {
			return div(
				function() {
					return function() {
						return div();
					}
				},[
					function () {
						return [
							span(),
							function () { return p() }
						];
					},
					function () { return div(
						function() {
							return span();
						}
					)},
				]
			);
		});

		equal(res.innerHTML, '<div></div><span></span><p></p><div><span></span></div>');
	});

	test("can use templates inside templates", 1, function() {
		var anyTpl = DOMTE.register(function insideTpl28 () {
			return div(
				span()
			);
		});
		var res = DOMTE.render(function t28 (_, data) {
			return div([
				_tpl.insideTpl28(_, data),
				p(),
				_tpl.insideTpl28(_, data),
			]);
		});

		equal(res.innerHTML, '<div><span></span></div><p></p><div><span></span></div>');
	});

	test("throw error for invalid inline template usage", 1, function() {
		var anyTpl = DOMTE.register(function insideTpl29 () {
			return div(
				span()
			);
		});
		try {
			var res = DOMTE.render(function t29 (_, data) {
				return div(
					_tpl.insideTpl29()
				);
			});
		} catch (error) {
			equal(error.message, 'You have to supply "_" as argument when calling inline template.');
		}

	});

	test("can use elements without paranthesis", 1, function() {
		var res = DOMTE.render(function t30 (_, data) {
			return div([
				div(div),
				p
			]);
		});

		equal(res.innerHTML, '<div><div></div></div><p></p>');
	});

	test("can use templates without paranthesis", 1, function() {
		var anyTpl = DOMTE.register(function insideTpl31 () {
			return div(
				span(p),
				p(data.textp)
			);
		});
		var res = DOMTE.render(function t31 (_, data) {
			return div(
				_tpl.insideTpl31
			);
		}, {textp: 'testText'});

		equal(res.innerHTML, '<div><span><p></p></span><p>testText</p></div>');
	});

})(QUnit);