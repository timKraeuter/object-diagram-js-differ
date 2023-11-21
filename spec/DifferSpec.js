import {
  expect
} from 'chai';

import {
  readFileSync
} from 'fs';

import ODModdle from 'object-diagram-moddle';

import { Differ } from '../lib/index.js';

describe('diff', function() {

  it('should discover add', async function() {
    // given
    const aDiagram = readFileSync('spec/fixtures/base.xml', 'utf-8');
    const bDiagram = readFileSync('spec/fixtures/add.xml', 'utf-8');

    // when
    const results = await getDiff(aDiagram, bDiagram);

    // then
    expect(results._added).to.have.keys(
      ['Object_2840', 'Link_Object_2669_to_Object_2840_type_components']);
    expect(results._removed).to.eql({});
    expect(results._layoutChanged).to.eql({});
    expect(results._changed).to.eql({});

  });

  it('should discover remove', async function() {

    // given
    const aDiagram = readFileSync('spec/fixtures/base.xml', 'utf-8');
    const bDiagram = readFileSync('spec/fixtures/remove.xml', 'utf-8');

    // when
    const results = await getDiff(aDiagram, bDiagram);

    // then
    expect(results._added).to.eql({});
    expect(results._removed).to.have.keys(
      ['Object_2839', 'Link_Object_2669_to_Object_2839_type_components']);
    expect(results._layoutChanged).to.eql({});
    expect(results._changed).to.eql({});

  });

  it('should discover change', async function() {

    // given
    const aDiagram = readFileSync('spec/fixtures/base.xml', 'utf-8');
    const bDiagram = readFileSync('spec/fixtures/change.xml', 'utf-8');

    // when
    const results = await getDiff(aDiagram, bDiagram);

    // then
    expect(results._added).to.eql({});
    expect(results._removed).to.eql({});
    expect(results._layoutChanged).to.eql({});
    expect(results._changed).to.have.keys(['Object_2839']);

    expect(results._changed['Object_2839'].attrs).to.deep.eq({
      name: { oldValue: '2:Component', newValue: '2:QuantifiedComponent' },
      attributeValues: { oldValue: 'quantity=77', newValue: 'quantity=1' }

    });
  });
});

// helpers //////////////////

async function importDiagram(diagram) {
  const moddle = new ODModdle();
  const defs = await moddle.fromXML(diagram);
  return defs.rootElement;
}

async function getDiff(a, b) {
  const aDefs = await importDiagram(a);
  const bDefs = await importDiagram(b);

  return new Differ().diff(aDefs, bDefs);
}

