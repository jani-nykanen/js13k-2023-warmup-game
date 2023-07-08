

JS_FILES := $(wildcard js/*.js) $(wildcard js/*/*.js)


.PHONY: js
js:
	tsc

watch:
	tsc -w

server:
	python3 -m http.server


closure:
	java -jar closure.jar --js $(JS_FILES) --js_output_file temp/out.js --compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2021