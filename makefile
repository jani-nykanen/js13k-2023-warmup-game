

JS_FILES := $(wildcard js/*.js) $(wildcard js/*/*.js)


.PHONY: js
js:
	tsc

watch:
	tsc -w

server:
	python3 -m http.server


closure:
	mkdir -p temp
	java -jar $(CLOSURE_PATH) --js $(JS_FILES) --js_output_file temp/out.js --compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2021

zip:


dist: js closure
	cp bitmap1.png temp/bitmap1.png
	cp font.png temp/font.png
	cp index.html temp/index.html
	(cd temp; zip -r ../dist.zip .)
	advzip -z dist.zip
	rm -rf ./temp
